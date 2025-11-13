import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart3,
  CreditCard,
  DollarSign,
  FileText,
  Receipt,
  Shield,
  TrendingUp,
  Users,
  Zap,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <DollarSign className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Fin Beacon Pro</span>
          </div>
          
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm font-medium transition-colors hover:text-primary">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium transition-colors hover:text-primary">
              How it Works
            </a>
            <a href="#pricing" className="text-sm font-medium transition-colors hover:text-primary">
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="gap-2">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container px-4 py-24 md:py-32">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Trusted by 10,000+ businesses worldwide</span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl">
              Financial Management
              <br />
              <span className="text-primary">Made Simple</span>
            </h1>

            <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Complete finance solution for freelancers and small businesses. Manage invoices,
              track expenses, handle payments, and gain insights—all in one place.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/register">
                <Button size="lg" className="gap-2 text-base">
                  Start Free Trial
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="gap-2 text-base">
                <BarChart3 className="h-5 w-5" />
                View Demo
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mx-auto mt-16 max-w-6xl">
            <div className="relative rounded-xl border bg-gradient-to-b from-muted/50 to-muted p-4 shadow-2xl">
              <div className="aspect-video overflow-hidden rounded-lg border bg-background">
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <BarChart3 className="h-24 w-24 opacity-20" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="border-t bg-muted/50 py-24">
          <div className="container px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need to manage your finances
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Powerful features designed to save you time and help your business grow
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-6xl gap-8 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<FileText className="h-6 w-6" />}
                title="Invoice Management"
                description="Create professional invoices in seconds. Track status, send reminders, and get paid faster."
              />
              <FeatureCard
                icon={<CreditCard className="h-6 w-6" />}
                title="Payment Tracking"
                description="Monitor all payments in real-time. Link payments to invoices and track outstanding balances."
              />
              <FeatureCard
                icon={<Users className="h-6 w-6" />}
                title="Client Management"
                description="Organize client information, view payment history, and maintain professional relationships."
              />
              <FeatureCard
                icon={<Receipt className="h-6 w-6" />}
                title="Expense Tracking"
                description="Log business expenses, attach receipts, and categorize spending for better insights."
              />
              <FeatureCard
                icon={<TrendingUp className="h-6 w-6" />}
                title="Budget Planning"
                description="Set monthly budgets, track actual vs. planned spending, and hit your financial goals."
              />
              <FeatureCard
                icon={<BarChart3 className="h-6 w-6" />}
                title="Analytics & Reports"
                description="Beautiful charts and reports. Understand your cash flow and make data-driven decisions."
              />
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="py-24">
          <div className="container px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Get started in minutes
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Simple setup process to get you up and running quickly
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-5xl gap-12 md:grid-cols-3">
              <StepCard
                number="1"
                title="Create Account"
                description="Sign up with email or Google. Set up your business profile in under a minute."
              />
              <StepCard
                number="2"
                title="Add Clients"
                description="Import or add your clients. Store contact info and business details securely."
              />
              <StepCard
                number="3"
                title="Start Managing"
                description="Create invoices, track payments, log expenses, and watch your business grow."
              />
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y bg-primary py-16 text-primary-foreground">
          <div className="container px-4">
            <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-4">
              <StatCard value="10K+" label="Active Users" />
              <StatCard value="$50M+" label="Invoices Processed" />
              <StatCard value="99.9%" label="Uptime" />
              <StatCard value="24/7" label="Support" />
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24">
          <div className="container px-4">
            <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="flex flex-col justify-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Built for modern businesses
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Fin Beacon Pro combines powerful features with an intuitive interface,
                  helping you focus on what matters most—growing your business.
                </p>

                <ul className="mt-8 space-y-4">
                  <BenefitItem text="Cloud-based access from anywhere, anytime" />
                  <BenefitItem text="Bank-level security with encrypted data" />
                  <BenefitItem text="Real-time collaboration with your team" />
                  <BenefitItem text="Automated reminders and notifications" />
                  <BenefitItem text="Export to PDF, Excel, and more" />
                </ul>
              </div>

              <div className="flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border bg-card p-6 text-center">
                    <Zap className="mx-auto h-8 w-8 text-primary" />
                    <div className="mt-4 text-2xl font-bold">Fast</div>
                    <div className="text-sm text-muted-foreground">Lightning quick</div>
                  </div>
                  <div className="rounded-lg border bg-card p-6 text-center">
                    <Shield className="mx-auto h-8 w-8 text-primary" />
                    <div className="mt-4 text-2xl font-bold">Secure</div>
                    <div className="text-sm text-muted-foreground">Bank-grade security</div>
                  </div>
                  <div className="rounded-lg border bg-card p-6 text-center">
                    <TrendingUp className="mx-auto h-8 w-8 text-primary" />
                    <div className="mt-4 text-2xl font-bold">Smart</div>
                    <div className="text-sm text-muted-foreground">AI-powered insights</div>
                  </div>
                  <div className="rounded-lg border bg-card p-6 text-center">
                    <Users className="mx-auto h-8 w-8 text-primary" />
                    <div className="mt-4 text-2xl font-bold">Collaborative</div>
                    <div className="text-sm text-muted-foreground">Team-friendly</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t bg-muted/50 py-24">
          <div className="container px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to take control of your finances?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Join thousands of businesses already using Fin Beacon Pro to manage their finances better.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link href="/register">
                  <Button size="lg" className="gap-2 text-base">
                    Get Started Free
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="text-base">
                  Schedule a Demo
                </Button>
              </div>

              <p className="mt-6 text-sm text-muted-foreground">
                No credit card required • 14-day free trial • Cancel anytime
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <DollarSign className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-bold">Fin Beacon Pro</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Complete finance management solution for modern businesses.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">Product</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground">Integrations</a></li>
                <li><a href="#" className="hover:text-foreground">Updates</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold">Company</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">About</a></li>
                <li><a href="#" className="hover:text-foreground">Blog</a></li>
                <li><a href="#" className="hover:text-foreground">Careers</a></li>
                <li><a href="#" className="hover:text-foreground">Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold">Legal</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground">Terms</a></li>
                <li><a href="#" className="hover:text-foreground">Security</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Fin Beacon Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-lg border bg-card p-6 transition-shadow hover:shadow-lg">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
        {number}
      </div>
      <h3 className="mt-4 text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-4xl font-bold">{value}</div>
      <div className="mt-2 text-sm opacity-90">{label}</div>
    </div>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
      <span className="text-muted-foreground">{text}</span>
    </li>
  );
}
