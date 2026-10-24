import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as BaseRouter } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@workspace/tymflo-design-system/components/ui/toaster';
import { TooltipProvider } from '@workspace/tymflo-design-system/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import FlowScorePage from '@/pages/flow-score';
import PrivacyPage from '@/pages/privacy';
import TermsPage from '@/pages/terms';
import GiveawayRulesPage from '@/pages/giveaway-rules';

const queryClient = new QueryClient();

function Router() {
  return (
    <ErrorBoundary>
      <Switch>
        <Route path="/" component={FlowScorePage} />
        <Route path="/flow-score" component={FlowScorePage} />
        <Route path="/privacy" component={PrivacyPage} />
        <Route path="/terms" component={TermsPage} />
        <Route path="/giveaway-rules" component={GiveawayRulesPage} />
        <Route component={NotFound} />
      </Switch>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BaseRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </BaseRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
