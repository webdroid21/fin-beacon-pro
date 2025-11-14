'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  createSupportTicket,
  getUserTickets,
  getTicketMessages,
  addTicketMessage,
} from '@/lib/firestore-support';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BookOpen,
  HelpCircle,
  MessageSquare,
  FileText,
  DollarSign,
  Users,
  Receipt,
  Wallet,
  BarChart3,
  Settings,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import type { SupportTicket, TicketMessage } from '@/types/support';
import { formatDistanceToNow } from 'date-fns';

const DOCUMENTATION_SECTIONS = [
  {
    icon: BookOpen,
    title: 'Getting Started',
    items: [
      {
        question: 'What is Fin Beacon Pro?',
        answer: 'Fin Beacon Pro is a comprehensive financial management platform designed to help businesses track invoices, expenses, payments, and generate detailed financial reports. It streamlines your accounting workflow with powerful analytics and automation features.',
      },
      {
        question: 'How do I set up my business profile?',
        answer: 'Navigate to Settings from the sidebar, then go to the Business Profile section. Fill in your business name, address, tax information, and other essential details. This information will be used in invoices and reports.',
      },
      {
        question: 'How do I invite team members?',
        answer: 'Currently, Fin Beacon Pro is designed for individual business use. Multi-user features are coming soon! You can track this in our roadmap.',
      },
    ],
  },
  {
    icon: DollarSign,
    title: 'Invoices',
    items: [
      {
        question: 'How do I create an invoice?',
        answer: 'Go to Invoices → Create Invoice. Fill in client details, add line items with descriptions and prices, apply taxes and discounts if needed, then save. You can preview the invoice before sending it to clients.',
      },
      {
        question: 'Can I customize invoice numbers?',
        answer: 'Yes! Go to Settings → Invoice Settings. You can set a custom prefix and enable auto-generation of invoice numbers. For example: INV-2024-001, INV-2024-002, etc.',
      },
      {
        question: 'How do I send invoices to clients?',
        answer: 'After creating an invoice, you can download it as PDF and send it via email to your client. The PDF includes all invoice details, your business information, and payment instructions.',
      },
      {
        question: 'What invoice statuses are available?',
        answer: 'Invoices can have the following statuses: Draft (not sent), Sent (sent to client), Paid (payment received), Overdue (past due date), Cancelled (voided).',
      },
    ],
  },
  {
    icon: Users,
    title: 'Clients',
    items: [
      {
        question: 'How do I add a new client?',
        answer: 'Navigate to Clients → Add Client. Enter client details including name, email, company, address, and contact information. Clients can be linked to multiple invoices.',
      },
      {
        question: 'Can I import clients from a spreadsheet?',
        answer: 'Bulk import is coming in a future update. Currently, clients need to be added individually through the Add Client form.',
      },
      {
        question: 'How do I view all invoices for a specific client?',
        answer: 'Go to the Clients page and click on a client. You\'ll see their profile with a list of all associated invoices, payments, and total amount owed.',
      },
    ],
  },
  {
    icon: Receipt,
    title: 'Expenses',
    items: [
      {
        question: 'How do I record an expense?',
        answer: 'Go to Expenses → Add Expense. Select the category, enter the amount, date, description, and optionally attach receipts. Expenses are automatically included in financial reports.',
      },
      {
        question: 'What expense categories are available?',
        answer: 'Default categories include: Office Supplies, Marketing, Travel, Utilities, Software, Equipment, Salaries, Rent, Insurance, and Other. You can track which categories have the highest spending.',
      },
      {
        question: 'Can I track both expenses and income?',
        answer: 'Yes! When adding a transaction, you can select Type: Expense or Income. Income from sources other than invoices (like interest, grants) can be tracked separately.',
      },
      {
        question: 'How do I attach receipts to expenses?',
        answer: 'Receipt attachment feature is coming soon. For now, you can note the receipt number or reference in the description field.',
      },
    ],
  },
  {
    icon: Wallet,
    title: 'Payments & Accounts',
    items: [
      {
        question: 'How do I record a payment?',
        answer: 'Go to Payments → Record Payment. Link it to an invoice, select payment method, enter amount and date. The invoice status will automatically update when fully paid.',
      },
      {
        question: 'What payment methods are supported?',
        answer: 'You can track payments via: Cash, Bank Transfer, Credit Card, Debit Card, Mobile Money, PayPal, Check, and Other. Choose the method that matches how you received payment.',
      },
      {
        question: 'How do I manage bank accounts?',
        answer: 'Navigate to Accounts to view all your connected financial accounts. You can add accounts, track balances, and transfer funds between accounts.',
      },
      {
        question: 'Can I track partial payments?',
        answer: 'Yes! When recording a payment, enter the partial amount received. The system tracks the remaining balance, and you can record additional payments until the invoice is fully paid.',
      },
    ],
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    items: [
      {
        question: 'What reports are available?',
        answer: 'The Dashboard provides: Revenue Trends, Income vs Expenses, Monthly Profit charts, Expense Category breakdown, and key metrics like Total Revenue, Net Profit, and Profit Margin.',
      },
      {
        question: 'How do I filter data by date range?',
        answer: 'Use the date range selector at the top of the Dashboard. Options include: Last 6 Months, Last 12 Months, Year to Date, and All Time. All charts update instantly.',
      },
      {
        question: 'Can I compare month-over-month performance?',
        answer: 'Yes! Use the comparison dropdown and select "Month over Month" or "Year over Year". Key metrics will show percentage changes with trend indicators.',
      },
      {
        question: 'How do I export reports?',
        answer: 'Navigate to Reports to generate and download PDF reports. You can create Profit & Loss statements, Balance Sheets, and custom date range reports.',
      },
    ],
  },
  {
    icon: Settings,
    title: 'Settings & Customization',
    items: [
      {
        question: 'How do I change my business currency?',
        answer: 'Go to Settings → Business Profile. Select your preferred currency from the dropdown. All financial data will display in your selected currency.',
      },
      {
        question: 'Can I customize the theme?',
        answer: 'Yes! Go to Settings → Appearance. Choose between Light, Dark, or System (auto-switches based on your device). The sidebar and click the theme toggle.',
      },
      {
        question: 'How do I update my email and notification preferences?',
        answer: 'Navigate to Settings → Notifications. Toggle email, SMS, and in-app notifications for different events like invoice payments, overdue invoices, and budget alerts.',
      },
      {
        question: 'Is my data secure?',
        answer: 'Absolutely! All data is encrypted in transit and at rest. We use Firebase for authentication and storage, with industry-standard security practices. Your data is private and never shared.',
      },
    ],
  },
];

const FAQ_ITEMS = [
  {
    question: 'Is there a mobile app?',
    answer: 'Fin Beacon Pro is a progressive web app (PWA), which means it works seamlessly on mobile browsers. You can add it to your home screen for an app-like experience. Native iOS and Android apps are planned for future releases.',
  },
  {
    question: 'How do I backup my data?',
    answer: 'Your data is automatically backed up in Firebase\'s cloud infrastructure with redundancy. You can export reports and invoices as PDFs for your records.',
  },
  {
    question: 'Can I use this for multiple businesses?',
    answer: 'Currently, each account supports one business profile. If you run multiple businesses, you\'ll need separate accounts. Multi-business support is on our roadmap.',
  },
  {
    question: 'What if I need help with something not covered here?',
    answer: 'Create a support ticket using the form below! Our team will get back to you as soon as possible. For urgent issues, mark your ticket as "Urgent" priority.',
  },
  {
    question: 'Are there any usage limits?',
    answer: 'No limits! Create unlimited invoices, clients, expenses, and reports. The platform scales with your business growth.',
  },
  {
    question: 'How do I delete my account?',
    answer: 'Go to Settings → Account → Delete Account. Please note that this action is irreversible and will permanently delete all your data.',
  },
];

export default function SupportPage() {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketMessages, setTicketMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showNewTicketDialog, setShowNewTicketDialog] = useState(false);

  // New ticket form
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'general' as SupportTicket['category'],
    priority: 'medium' as SupportTicket['priority'],
    description: '',
  });

  useEffect(() => {
    if (user) {
      loadTickets();
    }
  }, [user]);

  const loadTickets = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userTickets = await getUserTickets(user.uid);
      setTickets(userTickets);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTicketMessages = async (ticketId: string) => {
    try {
      const messages = await getTicketMessages(ticketId);
      setTicketMessages(messages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleCreateTicket = async () => {
    if (!user || !userProfile) return;
    if (!ticketForm.subject || !ticketForm.description) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await createSupportTicket(
        user.uid,
        user.email!,
        userProfile.displayName,
        ticketForm
      );
      setShowNewTicketDialog(false);
      setTicketForm({
        subject: '',
        category: 'general',
        priority: 'medium',
        description: '',
      });
      await loadTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!user || !userProfile || !selectedTicket || !newMessage.trim()) return;

    setLoading(true);
    try {
      await addTicketMessage(
        selectedTicket.ticketId,
        user.uid,
        userProfile.displayName,
        'user',
        newMessage
      );
      setNewMessage('');
      await loadTicketMessages(selectedTicket.ticketId);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: SupportTicket['status']) => {
    const variants: Record<SupportTicket['status'], { variant: any; icon: any }> = {
      open: { variant: 'default', icon: Clock },
      'in-progress': { variant: 'secondary', icon: Sparkles },
      resolved: { variant: 'outline', icon: CheckCircle2 },
      closed: { variant: 'outline', icon: CheckCircle2 },
    };
    const { variant, icon: Icon } = variants[status];
    return (
      <Badge variant={variant} className="capitalize">
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: SupportTicket['priority']) => {
    const colors: Record<SupportTicket['priority'], string> = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    };
    return (
      <Badge className={`capitalize ${colors[priority]}`}>
        {priority}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
          <p className="text-muted-foreground">
            Documentation, FAQs, and support tickets
          </p>
        </div>
        <Dialog open={showNewTicketDialog} onOpenChange={setShowNewTicketDialog}>
          <DialogTrigger asChild>
            <Button>
              <MessageSquare className="h-4 w-4 mr-2" />
              New Support Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
              <DialogDescription>
                Describe your issue and our team will get back to you
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Brief description of your issue"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={ticketForm.category}
                    onValueChange={(value: any) => setTicketForm({ ...ticketForm, category: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="technical">Technical Issue</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="feature-request">Feature Request</SelectItem>
                      <SelectItem value="bug">Bug Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={ticketForm.priority}
                    onValueChange={(value: any) => setTicketForm({ ...ticketForm, priority: value })}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Please provide detailed information about your issue..."
                  rows={6}
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                />
              </div>

              <Button
                onClick={handleCreateTicket}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Creating...' : 'Create Ticket'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="documentation" className="space-y-6">
        <TabsList>
          <TabsTrigger value="documentation">
            <BookOpen className="h-4 w-4 mr-2" />
            Documentation
          </TabsTrigger>
          <TabsTrigger value="faq">
            <HelpCircle className="h-4 w-4 mr-2" />
            FAQ
          </TabsTrigger>
          <TabsTrigger value="tickets">
            <MessageSquare className="h-4 w-4 mr-2" />
            My Tickets ({tickets.length})
          </TabsTrigger>
        </TabsList>

        {/* Documentation */}
        <TabsContent value="documentation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Complete App Documentation</CardTitle>
              <CardDescription>
                Everything you need to know about using Fin Beacon Pro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {DOCUMENTATION_SECTIONS.map((section, idx) => {
                const Icon = section.icon;
                return (
                  <div key={idx} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold">{section.title}</h3>
                    </div>
                    <div className="space-y-4 pl-13">
                      {section.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="space-y-2">
                          <h4 className="font-medium text-base">{item.question}</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      ))}
                    </div>
                    {idx < DOCUMENTATION_SECTIONS.length - 1 && (
                      <div className="border-b pt-4" />
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQ */}
        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Quick answers to common questions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {FAQ_ITEMS.map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-primary" />
                    {item.question}
                  </h4>
                  <p className="text-sm text-muted-foreground pl-6">
                    {item.answer}
                  </p>
                  {idx < FAQ_ITEMS.length - 1 && <div className="border-b pt-4" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tickets */}
        <TabsContent value="tickets" className="space-y-4">
          {selectedTicket ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle>{selectedTicket.subject}</CardTitle>
                    <CardDescription>
                      Ticket #{selectedTicket.ticketId.slice(0, 8)}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTicket(null)}
                  >
                    Back to Tickets
                  </Button>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  {getStatusBadge(selectedTicket.status)}
                  {getPriorityBadge(selectedTicket.priority)}
                  <Badge variant="outline" className="capitalize">
                    {selectedTicket.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {ticketMessages.map((message) => (
                      <div
                        key={message.messageId}
                        className={`flex gap-3 ${
                          message.senderRole === 'admin' ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <div
                          className={`flex-1 space-y-1 ${
                            message.senderRole === 'admin' ? 'text-right' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {message.senderName}
                            </span>
                            {message.senderRole === 'admin' && (
                              <Badge variant="secondary" className="text-xs">
                                Admin
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(message.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                          <div
                            className={`rounded-lg p-3 ${
                              message.senderRole === 'admin'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{message.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {selectedTicket.status !== 'closed' && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      rows={3}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={loading || !newMessage.trim()}
                      size="icon"
                      className="h-auto"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {tickets.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No tickets yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create your first support ticket to get help
                    </p>
                    <Button onClick={() => setShowNewTicketDialog(true)}>
                      Create Ticket
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                tickets.map((ticket) => (
                  <Card
                    key={ticket.ticketId}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={async () => {
                      setSelectedTicket(ticket);
                      await loadTicketMessages(ticket.ticketId);
                    }}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                          <CardDescription>
                            Created {formatDistanceToNow(new Date(ticket.createdAt), {
                              addSuffix: true,
                            })}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(ticket.status)}
                          {getPriorityBadge(ticket.priority)}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
