"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Search, Filter, Download, ExternalLink, ArrowUpRight, ArrowDownLeft, Wallet, ChevronDown, CheckCircle2, Clock, XCircle, FileText, ArrowRightLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function TransactionsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }

      // Fetch Profile
      const { data: profileData } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) setProfile(profileData);

      // Fetch Transactions
      const { data: txData } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (txData) setTransactions(txData);
      setIsLoading(false);
    }
    loadData();
  }, [router]);

  // Derived Stats
  const totalReceived = useMemo(() => {
    return transactions
      .filter(tx => ['DEPOSIT', 'TRANSFER_RECEIVED', 'WALLET_FUNDING'].includes(tx.type) && tx.status === 'COMPLETED')
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
  }, [transactions]);

  const totalSent = useMemo(() => {
    return transactions
      .filter(tx => ['WITHDRAWAL', 'TRANSFER_SENT'].includes(tx.type) && tx.status === 'COMPLETED')
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
  }, [transactions]);

  // Filtering
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = 
        tx.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (tx.stellar_tx_hash && tx.stellar_tx_hash.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (tx.sender_address && tx.sender_address.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (tx.recipient_address && tx.recipient_address.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(tx.status);
      const matchesType = typeFilter.length === 0 || typeFilter.includes(tx.type);

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [transactions, searchQuery, statusFilter, typeFilter]);

  const toggleStatusFilter = (status: string) => {
    setStatusFilter(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]);
  };

  const toggleTypeFilter = (type: string) => {
    setTypeFilter(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'COMPLETED': return <Badge variant="default" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20"><CheckCircle2 className="w-3 h-3 mr-1"/> Completed</Badge>;
      case 'PENDING': return <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20"><Clock className="w-3 h-3 mr-1"/> Pending</Badge>;
      case 'FAILED': return <Badge variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20"><XCircle className="w-3 h-3 mr-1"/> Failed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'WALLET_FUNDING': return <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center"><ArrowDownLeft className="w-4 h-4 text-emerald-500" /></div>;
      case 'DEPOSIT': return <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center"><ArrowUpRight className="w-4 h-4 text-blue-500" /></div>;
      case 'WITHDRAWAL': return <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center"><ArrowUpRight className="w-4 h-4 text-amber-500" /></div>;
      default: return <div className="w-8 h-8 rounded-full bg-slate-500/20 flex items-center justify-center"><ArrowRightLeft className="w-4 h-4 text-slate-500" /></div>;
    }
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Type", "Amount", "Currency", "Status", "Date", "Hash"];
    const csvContent = [
      headers.join(","),
      ...filteredTransactions.map(tx => [
        tx.id, tx.type, tx.amount, tx.currency, tx.status, new Date(tx.created_at).toISOString(), tx.stellar_tx_hash || ""
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "transactions_export.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return <div className="p-10 flex justify-center"><div className="w-8 h-8 border-4 border-[var(--orbit-brand)] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full relative">
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => router.push('/dashboard')} className="p-2 bg-[var(--orbit-bg-app)] border border-[var(--orbit-border)] rounded-full hover:bg-[var(--orbit-bg-elevated)] transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Transaction History</h1>
          <p className="text-sm text-[var(--orbit-text-secondary)]">View and manage your wallet activity</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--orbit-bg-elevated)] border border-[var(--orbit-border)] rounded-xl p-5 shadow-sm">
          <div className="text-sm text-[var(--orbit-text-secondary)] mb-1 flex justify-between items-center">
            Total Transactions <FileText className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-white">{transactions.length}</div>
        </div>
        <div className="bg-[var(--orbit-bg-elevated)] border border-[var(--orbit-border)] rounded-xl p-5 shadow-sm">
          <div className="text-sm text-[var(--orbit-text-secondary)] mb-1 flex justify-between items-center">
            Current Balance <Wallet className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-[var(--orbit-brand-light)]">{profile?.wallet_balance || '0.00'} USDC</div>
        </div>
        <div className="bg-[var(--orbit-bg-elevated)] border border-[var(--orbit-border)] rounded-xl p-5 shadow-sm">
          <div className="text-sm text-[var(--orbit-text-secondary)] mb-1 flex justify-between items-center">
            Total Received <ArrowDownLeft className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{totalReceived.toFixed(2)} USDC</div>
        </div>
        <div className="bg-[var(--orbit-bg-elevated)] border border-[var(--orbit-border)] rounded-xl p-5 shadow-sm">
          <div className="text-sm text-[var(--orbit-text-secondary)] mb-1 flex justify-between items-center">
            Total Sent <ArrowUpRight className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{totalSent.toFixed(2)} USDC</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--orbit-text-secondary)]" />
          <Input 
            placeholder="Search by hash, ID, or address..." 
            className="pl-9 bg-[var(--orbit-bg-elevated)] border-[var(--orbit-border)] text-white placeholder:text-[var(--orbit-text-secondary)]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="orbit-btn-secondary px-4 py-2 flex items-center justify-center gap-2 text-sm w-full sm:w-auto">
                <Filter className="w-4 h-4" /> Filter <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-[var(--orbit-bg-elevated)] border-[var(--orbit-border)] text-white">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[var(--orbit-border)]" />
              {['COMPLETED', 'PENDING', 'FAILED'].map(status => (
                <DropdownMenuCheckboxItem 
                  key={status}
                  checked={statusFilter.includes(status)}
                  onCheckedChange={() => toggleStatusFilter(status)}
                  className="hover:bg-white/10"
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuLabel className="mt-2">Type</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[var(--orbit-border)]" />
              {['WALLET_FUNDING', 'DEPOSIT', 'WITHDRAWAL', 'TRANSFER_SENT'].map(type => (
                <DropdownMenuCheckboxItem 
                  key={type}
                  checked={typeFilter.includes(type)}
                  onCheckedChange={() => toggleTypeFilter(type)}
                  className="hover:bg-white/10"
                >
                  {type.replace('_', ' ')}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button onClick={handleExportCSV} className="orbit-btn-secondary px-4 py-2 flex items-center justify-center gap-2 text-sm w-full sm:w-auto">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--orbit-bg-elevated)] border border-[var(--orbit-border)] rounded-xl overflow-hidden mt-2">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[var(--orbit-bg-app)]">
              <TableRow className="border-[var(--orbit-border)] hover:bg-transparent">
                <TableHead className="text-[var(--orbit-text-secondary)] font-medium">Transaction</TableHead>
                <TableHead className="text-[var(--orbit-text-secondary)] font-medium">ID / Hash</TableHead>
                <TableHead className="text-[var(--orbit-text-secondary)] font-medium text-right">Amount</TableHead>
                <TableHead className="text-[var(--orbit-text-secondary)] font-medium">Status</TableHead>
                <TableHead className="text-[var(--orbit-text-secondary)] font-medium">Date</TableHead>
                <TableHead className="text-[var(--orbit-text-secondary)] font-medium"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-[var(--orbit-text-secondary)]">
                    <div className="flex flex-col items-center justify-center">
                      <Wallet className="w-12 h-12 text-[var(--orbit-border)] mb-4" />
                      <p>No transactions found.</p>
                      <p className="text-xs mt-1">Transactions will appear here once wallet activity occurs.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map(tx => (
                  <TableRow key={tx.id} className="border-[var(--orbit-border)] hover:bg-white/5 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {getTypeIcon(tx.type)}
                        <div>
                          <div className="font-medium text-white">{tx.type.replace('_', ' ')}</div>
                          <div className="text-xs text-[var(--orbit-text-secondary)]">
                            {tx.type === 'WALLET_FUNDING' ? 'Added Funds' : 'Orbit Contribution'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-mono text-white max-w-[120px] truncate">{tx.id.split('-')[0]}...</div>
                      {tx.stellar_tx_hash && (
                        <div className="text-xs font-mono text-[var(--orbit-text-secondary)] truncate max-w-[120px]">
                          {tx.stellar_tx_hash}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-bold text-white">{Number(tx.amount).toFixed(2)} {tx.currency}</div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(tx.status)}
                    </TableCell>
                    <TableCell className="text-[var(--orbit-text-secondary)] text-sm">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Sheet>
                        <SheetTrigger asChild>
                          <button className="text-[var(--orbit-brand)] hover:text-white text-sm font-medium transition-colors">
                            Details
                          </button>
                        </SheetTrigger>
                        <SheetContent className="bg-[var(--orbit-bg-app)] border-l-[var(--orbit-border)] text-white w-[400px] sm:w-[540px]">
                          <SheetHeader className="px-6 pt-6 pb-2">
                            <SheetTitle className="text-white text-xl">Transaction Details</SheetTitle>
                          </SheetHeader>
                          <div className="flex flex-col gap-6 px-6 pb-8 overflow-y-auto h-full">
                            <div className="flex items-center justify-between p-4 bg-[var(--orbit-bg-elevated)] rounded-xl border border-[var(--orbit-border)] mt-2">
                              <div className="flex items-center gap-3">
                                {getTypeIcon(tx.type)}
                                <div className="font-medium text-white">{tx.type.replace('_', ' ')}</div>
                              </div>
                              <div className="text-xl font-bold text-white">{Number(tx.amount).toFixed(2)} {tx.currency}</div>
                            </div>

                            <div className="space-y-5">
                              <div>
                                <div className="text-xs text-[var(--orbit-text-secondary)] mb-1.5 font-medium uppercase tracking-wider">Status</div>
                                {getStatusBadge(tx.status)}
                              </div>
                              <div>
                                <div className="text-xs text-[var(--orbit-text-secondary)] mb-1.5 font-medium uppercase tracking-wider">Transaction ID</div>
                                <div className="font-mono text-sm text-white bg-[var(--orbit-bg-app)] p-2 rounded-md border border-[var(--orbit-border)] break-all">{tx.id}</div>
                              </div>
                              <div>
                                <div className="text-xs text-[var(--orbit-text-secondary)] mb-1.5 font-medium uppercase tracking-wider">Date & Time</div>
                                <div className="text-sm text-white">{new Date(tx.created_at).toLocaleString()}</div>
                              </div>
                              {tx.sender_address && (
                                <div>
                                  <div className="text-xs text-[var(--orbit-text-secondary)] mb-1.5 font-medium uppercase tracking-wider">Sender Address</div>
                                  <div className="font-mono text-sm text-[var(--orbit-text-secondary)] bg-[var(--orbit-bg-app)] p-2 rounded-md border border-[var(--orbit-border)] break-all">{tx.sender_address}</div>
                                </div>
                              )}
                              {tx.recipient_address && (
                                <div>
                                  <div className="text-xs text-[var(--orbit-text-secondary)] mb-1.5 font-medium uppercase tracking-wider">Recipient Address</div>
                                  <div className="font-mono text-sm text-[var(--orbit-text-secondary)] bg-[var(--orbit-bg-app)] p-2 rounded-md border border-[var(--orbit-border)] break-all">{tx.recipient_address}</div>
                                </div>
                              )}
                              {tx.stellar_tx_hash && (
                                <div>
                                  <div className="text-xs text-[var(--orbit-text-secondary)] mb-1.5 font-medium uppercase tracking-wider">Stellar Ledger Hash</div>
                                  <div className="font-mono text-sm break-all text-[var(--orbit-brand-light)] bg-[var(--orbit-bg-app)] p-3 rounded-md border border-[var(--orbit-border)] mb-3">{tx.stellar_tx_hash}</div>
                                  <a 
                                    href={`https://stellar.expert/explorer/testnet/tx/${tx.stellar_tx_hash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors px-4 py-2 rounded-lg font-medium"
                                  >
                                    View on Explorer <ExternalLink className="w-4 h-4" />
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </SheetContent>
                      </Sheet>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
