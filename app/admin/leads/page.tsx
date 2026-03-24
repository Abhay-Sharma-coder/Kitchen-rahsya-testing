'use client';

import { useEffect, useMemo, useState } from 'react';
import { Trash2, RefreshCw, Mail, Phone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type LeadStatus = 'new' | 'in_progress' | 'resolved';

type ContactLead = {
  _id: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  status: LeadStatus;
  createdAt: string;
};

const statusStyles: Record<LeadStatus, string> = {
  new: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
};

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<ContactLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | LeadStatus>('all');

  const fetchLeads = async () => {
    const token = localStorage.getItem('kr_token');
    if (!token) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/contact-leads', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = (await response.json()) as { leads?: ContactLead[] };
      setLeads(data.leads || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchLeads();
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const q = search.toLowerCase();
      const matchesSearch =
        lead.name.toLowerCase().includes(q) ||
        lead.email.toLowerCase().includes(q) ||
        lead.phone.includes(search) ||
        lead.subject.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leads, search, statusFilter]);

  const updateStatus = async (id: string, status: LeadStatus) => {
    const token = localStorage.getItem('kr_token');
    if (!token) {
      return;
    }

    const response = await fetch(`/api/contact-leads/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      return;
    }

    setLeads((prev) => prev.map((lead) => (lead._id === id ? { ...lead, status } : lead)));
  };

  const deleteLead = async (id: string) => {
    const token = localStorage.getItem('kr_token');
    if (!token) {
      return;
    }

    const response = await fetch(`/api/contact-leads/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return;
    }

    setLeads((prev) => prev.filter((lead) => lead._id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold">Contact Leads</h1>
          <p className="text-muted-foreground">Manage incoming contact inquiries from users</p>
        </div>
        <Button variant="outline" onClick={() => void fetchLeads()} disabled={loading} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <Input
              placeholder="Search by name, email, phone, subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | LeadStatus)}>
              <SelectTrigger className="w-full md:w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inquiries</CardTitle>
          <CardDescription>{filteredLeads.length} result(s)</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No inquiries found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead) => (
                  <TableRow key={lead._id}>
                    <TableCell>
                      <p className="font-medium">{lead.name}</p>
                      <div className="mt-1 space-y-1 text-xs text-muted-foreground">
                        <p className="flex items-center gap-1"><Mail className="h-3 w-3" /> {lead.email}</p>
                        <p className="flex items-center gap-1"><Phone className="h-3 w-3" /> {lead.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{lead.subject}</TableCell>
                    <TableCell>
                      <p className="max-w-md truncate text-sm text-muted-foreground">{lead.message}</p>
                    </TableCell>
                    <TableCell>
                      <Select value={lead.status} onValueChange={(value) => void updateStatus(lead._id, value as LeadStatus)}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                      <Badge className={`mt-2 ${statusStyles[lead.status]}`}>{lead.status.replace('_', ' ')}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => void deleteLead(lead._id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
