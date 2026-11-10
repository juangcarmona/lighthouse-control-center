// Consumer verification adapted from the installed Lighthouse dotnet-backend profile.
// Legacy runtime tests remain in verify-runtime's provisioned PostgreSQL / Docker lanes.
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';

import { prepareAspire } from './prepare-aspire.mjs';

const root = process.cwd();
const environment = await prepareAspire();
function dotnet(args, options = {}) {
  const result = spawnSync('dotnet', args, { cwd: root, env: environment, encoding: 'utf8', ...options });
  if (result.error) throw result.error;
  return result;
}
const build = dotnet(['build', 'SoFa.slnx', '--no-restore', '-c', 'Release', '--disable-build-servers'], { stdio: 'inherit' });
if (build.status !== 0) process.exit(build.status ?? 1);

const files = [];
async function collect(folder) {
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    if (['bin', 'obj'].includes(entry.name)) continue;
    const path = join(folder, entry.name);
    if (entry.isDirectory()) await collect(path);
    else if (entry.isFile() && entry.name.endsWith('.cs')) files.push(path);
  }
}
for (const folder of ['src/SoFa.AppHost', 'src/SoFa.Web', 'src/SoFa.Modules.Workspace', 'src/dotnet', 'tests/SoFa.Web.Tests']) await collect(folder);
const format = dotnet(['format', 'whitespace', '.', '--folder', '--verify-no-changes', '--include', ...files, '--verbosity', 'quiet'], { stdio: 'inherit' });
if (format.status !== 0) process.exit(format.status ?? 1);

for (const match of (await readFile('SoFa.slnx', 'utf8')).matchAll(/<Project Path="([^"]+\.csproj)"/g)) {
  const evaluated = dotnet(['msbuild', match[1], '-getProperty:AssemblyName,LighthouseModule', '-getItem:ProjectReference,CompilerVisibleProperty']);
  if (evaluated.status !== 0) throw Error('Cannot evaluate the solution module contract.');
  const project = JSON.parse(evaluated.stdout), assembly = project.Properties.AssemblyName;
  if (!assembly.includes('.Modules.') || assembly.endsWith('.Contracts') || assembly.endsWith('Tests')) continue;
  if (project.Properties.LighthouseModule !== 'true'
      || !project.Items.CompilerVisibleProperty?.some(property => property.Identity === 'LighthouseModule')
      || !project.Items.ProjectReference.some(reference =>
        reference.Identity.endsWith('Lighthouse.Analyzers.csproj') && reference.OutputItemType === 'Analyzer' && reference.ReferenceOutputAssembly === 'false'))
    throw Error('Every implementation module must activate and reference the shared analyzer.');
}

const probe = await mkdtemp(join(tmpdir(), 'sofa-dotnet-rejection-'));
const xml = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
const analyzer = xml(resolve(root, 'src/dotnet/Lighthouse.Analyzers/Lighthouse.Analyzers.csproj'));
const cqrs = xml(resolve(root, 'src/dotnet/Lighthouse.Cqrs/Lighthouse.Cqrs.csproj'));
const baseProject = (name, extra = '') => `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup><TargetFramework>net10.0</TargetFramework><ImplicitUsings>enable</ImplicitUsings>
    <AssemblyName>SoFa.Probe.Modules.${name}</AssemblyName><LighthouseModule>true</LighthouseModule></PropertyGroup>
  <ItemGroup><CompilerVisibleProperty Include="LighthouseModule" />
    <ProjectReference Include="${cqrs}" />
    <ProjectReference Include="${analyzer}" OutputItemType="Analyzer" ReferenceOutputAssembly="false" />
    ${extra}
  </ItemGroup></Project>`;
function assertBuild(result, expectedDiagnostic, forbiddenDiagnostic) {
  const output = result.stdout + result.stderr;
  const diagnosticIds = new Set([...output.matchAll(/error ([A-Z]+\d+)\b/g)].map(match => match[1]));
  if (result.status === 0 || diagnosticIds.size !== 1 || !diagnosticIds.has(expectedDiagnostic)
      || diagnosticIds.has(forbiddenDiagnostic)) {
    process.stderr.write(output);
    throw Error(`Expected compilation failure with ${expectedDiagnostic} only.`);
  }
}
try {
  await mkdir(join(probe, 'Sibling'));
  await mkdir(join(probe, 'Valid'));
  await mkdir(join(probe, 'Invalid'));
  await mkdir(join(probe, 'InvalidReference'));
  await writeFile(join(probe, 'Sibling/Sibling.csproj'), '<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><TargetFramework>net10.0</TargetFramework><AssemblyName>SoFa.Probe.Modules.Sibling</AssemblyName></PropertyGroup></Project>');
  await writeFile(join(probe, 'Sibling/Sibling.cs'), 'namespace SoFa.Probe.Modules.Sibling; public sealed class SiblingExport {}');
  await writeFile(join(probe, 'Valid/Valid.csproj'), baseProject('Valid'));
  await writeFile(join(probe, 'Valid/Valid.cs'), `using QueryContract = JuanGCarmona.Lighthouse.Cqrs.IQueryHandler<string, string>;
    namespace SoFa.Probe.Modules.Valid;
    internal interface IAliasedQuery : QueryContract { }
    internal sealed class ValidHandler : IAliasedQuery {
      public Task<string> Handle(string query, CancellationToken token) => Task.FromResult(query);
    }
    public sealed class NonHandlerExport { }`);
  const valid = dotnet(['build', join(probe, 'Valid/Valid.csproj'), '-c', 'Release', '--disable-build-servers']);
  if (valid.status !== 0 || /error LH100[12]\b/.test(valid.stdout + valid.stderr)) {
    process.stderr.write(valid.stdout + valid.stderr); throw Error('The supported semantic handler fixture must compile without architecture diagnostics.');
  }

  await writeFile(join(probe, 'Invalid/Invalid.csproj'), baseProject('Invalid'));
  await writeFile(join(probe, 'Invalid/Invalid.cs'), `using JuanGCarmona.Lighthouse.Cqrs;
    namespace SoFa.Probe.Modules.Invalid;
    public class ExposedHandler : IQueryHandler<string, string> {
      public Task<string> Handle(string query, CancellationToken token) => Task.FromResult(query);
    }`);
  assertBuild(dotnet(['build', join(probe, 'Invalid/Invalid.csproj'), '-c', 'Release', '--disable-build-servers']), 'LH1001', 'LH1002');

  await writeFile(join(probe, 'InvalidReference/InvalidReference.csproj'), baseProject('InvalidReference',
    '<ProjectReference Include="../Sibling/Sibling.csproj" />'));
  await writeFile(join(probe, 'InvalidReference/InvalidReference.cs'), 'namespace SoFa.Probe.Modules.InvalidReference; internal sealed class ValidNonHandler { }');
  assertBuild(dotnet(['build', join(probe, 'InvalidReference/InvalidReference.csproj'), '-c', 'Release', '--disable-build-servers']), 'LH1002', 'LH1001');
  console.log('Every implementation module exposes analyzer activation; compiled exports and real LH1001 / LH1002 fixtures verified.');
} finally { await rm(probe, { recursive: true, force: true }); }
