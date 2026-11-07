using System.Net;
using JuanGCarmona.SoFa.Modules.Workspace.Source;

namespace SoFa.Web.Tests;

public sealed class SourceRequestGateTests
{
  [Fact]
  public async Task InvalidatedScopeNeverStartsItsCredentialBearingRequest()
  {
    using var stopped = new CancellationTokenSource();
    stopped.Cancel();
    using var handler = new WaitingHandler(() => false);
    using var transport = new GitHubTransport(handler);
    using var result = await transport.GetAsync("/user", "isolated-source-value",
        new(new object(), () => false, stopped.Token), CancellationToken.None);
    Assert.Equal(0, (int)result.Status);
    Assert.Equal(0, handler.Started);
  }

  [Fact]
  public async Task RequestInitiationIsOrderedAgainstInvalidationAndPendingIoIsCancelled()
  {
    var sync = new object();
    var live = true;
    using var stopped = new CancellationTokenSource();
    using var release = new ManualResetEventSlim();
    var checkedIdentity = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
    var invalidationAttempted = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
    using var handler = new WaitingHandler(() => live);
    using var transport = new GitHubTransport(handler);
    var guard = new SourceRequestGuard(sync, () =>
    {
      var captured = live;
      checkedIdentity.TrySetResult();
      Assert.True(release.Wait(TimeSpan.FromSeconds(10)));
      return captured;
    }, stopped.Token);
    var reading = Task.Run(() => transport.GetAsync("/user", "isolated-source-value", guard, CancellationToken.None));
    await checkedIdentity.Task.WaitAsync(TimeSpan.FromSeconds(10));
    var disconnecting = Task.Run(() =>
    {
      invalidationAttempted.TrySetResult();
      lock (sync) { live = false; stopped.Cancel(); }
    });
    try
    {
      await invalidationAttempted.Task.WaitAsync(TimeSpan.FromSeconds(10));
      Assert.False(disconnecting.IsCompleted, "Invalidation cannot pass between the identity check and request initiation.");
    }
    finally { release.Set(); }
    await disconnecting.WaitAsync(TimeSpan.FromSeconds(10));
    using var result = await reading.WaitAsync(TimeSpan.FromSeconds(10));
    Assert.Equal(1, handler.Started);
    Assert.True(handler.StartedWhileLive);
    Assert.True(handler.Cancelled);
    Assert.Equal(0, (int)result.Status);
    using var later = await transport.GetAsync("/user", "isolated-source-value", guard, CancellationToken.None);
    Assert.Equal(0, (int)later.Status);
    Assert.Equal(1, handler.Started);
  }

  private sealed class WaitingHandler(Func<bool> live) : HttpMessageHandler
  {
    internal int Started { get; private set; }
    internal bool StartedWhileLive { get; private set; }
    internal bool Cancelled { get; private set; }
    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
      Started++;
      StartedWhileLive = live();
      try { await Task.Delay(Timeout.InfiniteTimeSpan, cancellationToken); }
      catch (OperationCanceledException) { Cancelled = true; throw; }
      return new(HttpStatusCode.OK);
    }
  }
}
