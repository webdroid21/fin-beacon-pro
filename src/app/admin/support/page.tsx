'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AdminGuard } from '@/components/admin/AdminGuard';
import {
  getAllTickets,
  getTicketMessages,
  addTicketMessage,
  updateTicketStatus,
  updateTicketPriority,
} from '@/lib/firestore-support';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  Filter,
  Shield,
} from 'lucide-react';
import type { SupportTicket, TicketMessage } from '@/types/support';
import { formatDistanceToNow } from 'date-fns';

function AdminSupportContent() {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketMessages, setTicketMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  useEffect(() => {
    if (user && userProfile?.role === 'admin') {
      loadTickets();
    }
  }, [user, userProfile]);

  useEffect(() => {
    filterTickets();
  }, [tickets, statusFilter, priorityFilter]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const allTickets = await getAllTickets();
      setTickets(allTickets);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTickets = () => {
    let filtered = [...tickets];

    if (statusFilter !== 'all') {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter((t) => t.priority === priorityFilter);
    }

    setFilteredTickets(filtered);
  };

  const loadTicketMessages = async (ticketId: string) => {
    try {
      const messages = await getTicketMessages(ticketId);
      setTicketMessages(messages);
    } catch (error) {
      console.error('Error loading messages:', error);
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
        'admin',
        newMessage
      );
      setNewMessage('');
      await loadTicketMessages(selectedTicket.ticketId);
      await loadTickets();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: SupportTicket['status']) => {
    if (!selectedTicket || !user) return;

    setLoading(true);
    try {
      await updateTicketStatus(selectedTicket.ticketId, status, user.uid);
      setSelectedTicket({ ...selectedTicket, status });
      await loadTickets();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePriority = async (priority: SupportTicket['priority']) => {
    if (!selectedTicket) return;

    setLoading(true);
    try {
      await updateTicketPriority(selectedTicket.ticketId, priority);
      setSelectedTicket({ ...selectedTicket, priority });
      await loadTickets();
    } catch (error) {
      console.error('Error updating priority:', error);
      alert('Failed to update priority');
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
      low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
    };
    return (
      <Badge className={`capitalize ${colors[priority]}`}>
        <AlertCircle className="h-3 w-3 mr-1" />
        {priority}
      </Badge>
    );
  };

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'open').length,
    inProgress: tickets.filter((t) => t.status === 'in-progress').length,
    resolved: tickets.filter((t) => t.status === 'resolved').length,
    urgent: tickets.filter((t) => t.priority === 'urgent').length,
  };

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Admin Support Center
          </h1>
          <p className="text-muted-foreground">
            Manage and respond to user support tickets
          </p>
        </div>
        <Button onClick={loadTickets} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.open}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Urgent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">Status:</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm">Priority:</span>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets */}
      {selectedTicket ? (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <CardTitle>{selectedTicket.subject}</CardTitle>
                <CardDescription>
                  Ticket #{selectedTicket.ticketId.slice(0, 8)} • From {selectedTicket.userName} ({selectedTicket.userEmail})
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTicket(null)}
              >
                Back to List
              </Button>
            </div>

            <div className="flex items-center gap-2 pt-2 flex-wrap">
              <Select
                value={selectedTicket.status}
                onValueChange={(value: any) => handleUpdateStatus(value)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={selectedTicket.priority}
                onValueChange={(value: any) => handleUpdatePriority(value)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>

              <Badge variant="outline" className="capitalize">
                {selectedTicket.category}
              </Badge>

              <span className="text-xs text-muted-foreground">
                Created {formatDistanceToNow(new Date(selectedTicket.createdAt), { addSuffix: true })}
              </span>
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
                      <div className={`flex items-center gap-2 ${
                        message.senderRole === 'admin' ? 'justify-end' : ''
                      }`}>
                        <span className="text-sm font-medium">
                          {message.senderName}
                        </span>
                        {message.senderRole === 'admin' && (
                          <Badge variant="secondary" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
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
                        <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex gap-2 pt-4 border-t">
              <Textarea
                placeholder="Type your response..."
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
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredTickets.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tickets found</h3>
                <p className="text-sm text-muted-foreground">
                  {statusFilter !== 'all' || priorityFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'No support tickets yet'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTickets.map((ticket) => (
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
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                      <CardDescription>
                        From {ticket.userName} ({ticket.userEmail}) •{' '}
                        {formatDistanceToNow(new Date(ticket.createdAt), {
                          addSuffix: true,
                        })}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {getStatusBadge(ticket.status)}
                      {getPriorityBadge(ticket.priority)}
                      <Badge variant="outline" className="capitalize">
                        {ticket.category}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminSupportPage() {
  return (
    <AdminGuard>
      <AdminSupportContent />
    </AdminGuard>
  );
}
