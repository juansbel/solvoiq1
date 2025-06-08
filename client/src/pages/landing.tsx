import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart3,
  Users,
  Zap,
  Shield,
  TrendingUp,
  Clock,
  Mail,
  Target,
  Calendar,
  CheckCircle,
  Star,
  ArrowRight,
  Globe,
  Smartphone,
  Brain,
  DollarSign,
  MessageSquare,
  FileText,
  PlayCircle
} from "lucide-react";

const FEATURES = [
  {
    icon: Brain,
    title: "AI-Powered Intelligence",
    description: "Advanced AI automation for email analysis, predictive insights, and strategic decision support",
    benefit: "Save 20+ hours per week"
  },
  {
    icon: BarChart3,
    title: "Executive Dashboard",
    description: "Real-time business intelligence with KPI monitoring, revenue tracking, and performance analytics",
    benefit: "360° operational visibility"
  },
  {
    icon: Target,
    title: "Strategic Operations",
    description: "Complete operational oversight with client lifecycle management and automated workflows",
    benefit: "40% faster decision-making"
  },
  {
    icon: Users,
    title: "Team Intelligence",
    description: "Enhanced team coordination with performance tracking, 1-on-1 insights, and productivity analytics",
    benefit: "Optimize team performance"
  },
  {
    icon: DollarSign,
    title: "Revenue Intelligence",
    description: "Advanced commission tracking, goal monitoring, and revenue optimization with predictive analytics",
    benefit: "Maximize revenue potential"
  },
  {
    icon: MessageSquare,
    title: "Communication Intelligence",
    description: "AI-powered communication optimization, template management, and client interaction analysis",
    benefit: "Professional excellence"
  }
];

const STATS = [
  { value: "150+", label: "Enterprise Clients", icon: Users },
  { value: "40%", label: "Productivity Increase", icon: TrendingUp },
  { value: "15hrs", label: "Weekly Time Saved", icon: Clock },
  { value: "99.9%", label: "Uptime Guarantee", icon: Shield }
];

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "CEO, TechCorp",
    company: "Fortune 500 Technology Company",
    quote: "SolvoIQ transformed our intelligence operations. We've achieved 45% increase in strategic decision-making speed and operational excellence across all departments.",
    rating: 5
  },
  {
    name: "Michael Rodriguez",
    role: "Operations Director",
    company: "Global Consulting Firm",
    quote: "The executive dashboard and real-time intelligence features provide unprecedented operational visibility. ROI was achieved within 45 days of implementation.",
    rating: 5
  },
  {
    name: "Jennifer Walsh",
    role: "VP of Strategic Operations",
    company: "Enterprise Solutions Inc",
    quote: "SolvoIQ's intelligence operations platform revolutionized our business processes. The predictive analytics and automated insights are game-changing.",
    rating: 5
  }
];

const PRICING_TIERS = [
  {
    name: "Professional",
    price: "$49",
    period: "per user/month",
    description: "Perfect for growing teams",
    features: [
      "Up to 25 team members",
      "Advanced AI features",
      "Client management suite",
      "Basic analytics",
      "Email support"
    ],
    popular: false
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "per user/month",
    description: "For large organizations",
    features: [
      "Unlimited team members",
      "Full AI automation suite",
      "Advanced analytics & reporting",
      "Custom integrations",
      "24/7 priority support",
      "Dedicated success manager"
    ],
    popular: true
  },
  {
    name: "Custom",
    price: "Contact us",
    period: "tailored pricing",
    description: "Enterprise-grade solutions",
    features: [
      "White-label options",
      "Custom AI model training",
      "On-premise deployment",
      "SLA guarantees",
      "Executive training program"
    ],
    popular: false
  }
];

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    // Integrate with your email capture service
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-slate-900">SolvoIQ</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-600 hover:text-slate-900 transition-colors">Features</a>
              <a href="#pricing" className="text-slate-600 hover:text-slate-900 transition-colors">Pricing</a>
              <a href="#testimonials" className="text-slate-600 hover:text-slate-900 transition-colors">Success Stories</a>
              <Button variant="outline" size="sm" onClick={() => window.location.href = "/signin"}>Sign In</Button>
              <Button size="sm" onClick={() => window.location.href = "/signin"}>Start Free Trial</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-100">
            <Zap className="h-4 w-4 mr-1" />
            Now with Advanced AI Automation
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">SolvoIQ</span>
            <br />
            <span className="text-3xl md:text-4xl font-semibold text-slate-700">Intelligence Operations Dashboard</span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform business operations with AI-powered intelligence. Streamline client communications, 
            optimize team productivity, and drive strategic growth with real-time insights and automated workflows.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="text-lg px-8 py-4" onClick={() => window.location.href = "/signin"}>
              <PlayCircle className="mr-2 h-5 w-5" />
              Start Free 14-Day Trial
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4" onClick={() => window.location.href = "/signin"}>
              <Calendar className="mr-2 h-5 w-5" />
              Schedule Demo
            </Button>
          </div>
          
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            {STATS.map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-sm text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Intelligence Operations Platform
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Comprehensive AI-powered dashboard designed for executive decision-making and strategic business intelligence
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">{feature.description}</p>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    {feature.benefit}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-slate-600">
              See how top companies are transforming their operations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-700 italic">"{testimonial.quote}"</p>
                </CardHeader>
                <CardContent>
                  <div className="border-t pt-4">
                    <div className="font-semibold text-slate-900">{testimonial.name}</div>
                    <div className="text-sm text-slate-600">{testimonial.role}</div>
                    <div className="text-sm text-blue-600">{testimonial.company}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-slate-600">
              Choose the plan that scales with your business
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PRICING_TIERS.map((tier, index) => (
              <Card key={index} className={`border-2 ${tier.popular ? 'border-blue-500 shadow-xl scale-105' : 'border-slate-200'}`}>
                <CardHeader className="text-center">
                  {tier.popular && (
                    <Badge className="mb-4 bg-blue-600 text-white">Most Popular</Badge>
                  )}
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <div className="text-4xl font-bold text-slate-900 mt-4">
                    {tier.price}
                    <span className="text-lg font-normal text-slate-600">/{tier.period}</span>
                  </div>
                  <p className="text-slate-600">{tier.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                        <span className="text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={tier.popular ? "default" : "outline"}
                    size="lg"
                  >
                    {tier.name === "Custom" ? "Contact Sales" : "Start Free Trial"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Operations?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of businesses already using Client Hub AI to streamline their workflows and boost productivity.
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your business email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-white text-slate-900"
              required
            />
            <Button type="submit" size="lg" className="bg-white text-blue-600 hover:bg-slate-100">
              {isSubmitted ? "Thanks!" : "Get Started"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
          
          <p className="text-sm opacity-75 mt-4">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold">Client Hub AI</span>
              </div>
              <p className="text-slate-400">
                Transforming business operations with AI-powered client management.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-8 bg-slate-700" />
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400">
              © 2024 Client Hub AI. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}