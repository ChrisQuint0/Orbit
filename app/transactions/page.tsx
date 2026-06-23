"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Search, Filter, Download, ExternalLink, ArrowUpRight, ArrowDownLeft, Wallet, ChevronDown, CheckCircle2, Clock, XCircle, FileText, ArrowRightLeft, Copy, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { OrbitLoader } from "@/components/orbit-loader";
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

  // Copy feedback state
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'COMPLETED': 
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[var(--orbit-success-bg)] text-[var(--orbit-success)] border border-[var(--orbit-success-border)] tracking-wider uppercase">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case 'PENDING': 
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[var(--orbit-warning-bg)] text-[var(--orbit-warning)] border border-[var(--orbit-warning-border)] tracking-wider uppercase">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
      case 'FAILED': 
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[var(--orbit-danger-bg)] text-[var(--orbit-danger)] border border-[var(--orbit-danger-border)] tracking-wider uppercase">
            <XCircle className="w-3.5 h-3.5" /> Failed
          </span>
        );
      default: 
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[var(--color-orbit-mist-900)] text-[var(--color-orbit-mist-400)] border border-[var(--orbit-border)] tracking-wider uppercase">
            {status}
          </span>
        );
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'WALLET_FUNDING': 
        return (
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.06)] shrink-0">
            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
          </div>
        );
      case 'DEPOSIT': 
        return (
          <div className="w-9 h-9 rounded-xl bg-[var(--orbit-brand-bg)] border border-[var(--orbit-brand-border)] flex items-center justify-center shadow-[0_0_12px_rgba(124,110,247,0.06)] shrink-0">
            <ArrowUpRight className="w-4 h-4 text-[var(--orbit-brand-light)]" />
          </div>
        );
      case 'TRANSFER_RECEIVED':
        return (
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.06)] shrink-0">
            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
          </div>
        );
      case 'WITHDRAWAL': 
        return (
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.06)] shrink-0">
            <ArrowUpRight className="w-4 h-4 text-amber-500" />
          </div>
        );
      default: 
        return (
          <div className="w-9 h-9 rounded-xl bg-slate-500/10 border border-slate-500/20 flex items-center justify-center shrink-0">
            <ArrowRightLeft className="w-4 h-4 text-slate-400" />
          </div>
        );
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
    return <OrbitLoader text="Syncing Activity Ledger..." />;
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full relative">
      
      {/* Header section */}
      <div className="flex items-center gap-4 mb-2" style={{ animation: 'fade-in-up 0.4s ease-out forwards' }}>
        <button 
          onClick={() => router.push('/dashboard')} 
          className="p-2.5 bg-transparent border border-[var(--orbit-border)] rounded-xl hover:bg-[var(--orbit-bg-elevated)] hover:border-[var(--orbit-border-hover)] text-[var(--orbit-text-secondary)] hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight orbit-gradient-text">Activity Ledger</h1>
          <p className="text-sm text-[var(--orbit-text-secondary)]">Inspect and review your historical transactions on Orbit</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" 
        style={{ animation: 'fade-in-up 0.5s ease-out forwards', animationDelay: '0.05s', animationFillMode: 'backwards' }}
      >
        {[
          { 
            label: "Total Transactions", 
            value: transactions.length, 
            icon: FileText, 
            color: "text-white", 
            detail: "records logged" 
          },
          { 
            label: "Current Balance", 
            value: `${Number(profile?.wallet_balance || 0).toFixed(2)} USDC`, 
            icon: Wallet, 
            color: "text-[var(--orbit-brand-light)]", 
            detail: "Stellar Account" 
          },
          { 
            label: "Total Received", 
            value: `+${totalReceived.toFixed(2)} USDC`, 
            icon: ArrowDownLeft, 
            color: "text-[var(--orbit-success)]", 
            detail: "inward deposits" 
          },
          { 
            label: "Total Sent", 
            value: `-${totalSent.toFixed(2)} USDC`, 
            icon: ArrowUpRight, 
            color: "text-amber-400", 
            detail: "outward releases" 
          }
        ].map((card, i) => (
          <div key={i} className="orbit-shimmer relative bg-gradient-to-b from-[var(--orbit-bg-card)] to-[var(--color-orbit-void-800)]/80 border border-[var(--orbit-border)] rounded-xl p-5 shadow-lg flex flex-col justify-between hover:border-[var(--orbit-border-hover)] transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--orbit-text-secondary)] font-mono">{card.label}</span>
              <div className="w-7 h-7 rounded-lg bg-[var(--orbit-bg-elevated)] border border-[var(--orbit-border)] flex items-center justify-center">
                <card.icon className={`w-3.5 h-3.5 ${card.color}`} />
              </div>
            </div>
            <div>
              <div className={`text-2xl font-bold font-mono tracking-tight leading-none mb-1.5 ${card.color}`}>{card.value}</div>
              <span className="text-[10px] text-[var(--orbit-text-muted)] font-medium font-mono uppercase">{card.detail}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div 
        className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-4"
        style={{ animation: 'fade-in-up 0.5s ease-out forwards', animationDelay: '0.1s', animationFillMode: 'backwards' }}
      >
        <div className="relative w-full sm:w-96 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--orbit-text-muted)] group-focus-within:text-[var(--orbit-brand-light)] transition-colors" />
          <Input 
            placeholder="Search by hash, ID, or address..." 
            className="pl-10 bg-[var(--orbit-bg-card)] border-[var(--orbit-border)] hover:border-[var(--orbit-border-hover)] focus:border-[var(--orbit-brand)]/80 focus:ring-1 focus:ring-[var(--orbit-brand)]/40 text-white placeholder:text-[var(--orbit-text-muted)] rounded-xl h-10 transition-all font-sans"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="orbit-btn-secondary px-4 py-2 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider h-10 w-full sm:w-auto border-[var(--orbit-border)] hover:border-[var(--orbit-border-hover)] rounded-xl transition-all cursor-pointer">
                <Filter className="w-3.5 h-3.5 text-[var(--orbit-brand-light)]" /> Filter <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-[var(--color-orbit-void-950)] border-[var(--orbit-border)] text-white shadow-xl rounded-xl p-1.5">
              <DropdownMenuLabel className="text-[10px] uppercase font-mono tracking-widest text-[var(--orbit-text-muted)] px-2.5 py-1.5">Status</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[var(--orbit-border)]/50 my-1" />
              {['COMPLETED', 'PENDING', 'FAILED'].map(status => (
                <DropdownMenuCheckboxItem 
                  key={status}
                  checked={statusFilter.includes(status)}
                  onCheckedChange={() => toggleStatusFilter(status)}
                  className="hover:bg-[var(--orbit-brand-bg)] hover:text-[var(--orbit-brand-light)] rounded-lg text-xs font-medium cursor-pointer transition-colors"
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuLabel className="mt-2 text-[10px] uppercase font-mono tracking-widest text-[var(--orbit-text-muted)] px-2.5 py-1.5">Type</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[var(--orbit-border)]/50 my-1" />
              {['WALLET_FUNDING', 'DEPOSIT', 'WITHDRAWAL', 'TRANSFER_SENT', 'TRANSFER_RECEIVED'].map(type => (
                <DropdownMenuCheckboxItem 
                  key={type}
                  checked={typeFilter.includes(type)}
                  onCheckedChange={() => toggleTypeFilter(type)}
                  className="hover:bg-[var(--orbit-brand-bg)] hover:text-[var(--orbit-brand-light)] rounded-lg text-xs font-medium cursor-pointer transition-colors"
                >
                  {type.replace('_', ' ')}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button 
            onClick={handleExportCSV} 
            className="orbit-btn-secondary px-4 py-2 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider h-10 w-full sm:w-auto border-[var(--orbit-border)] hover:border-[var(--orbit-border-hover)] rounded-xl transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[var(--orbit-brand-light)]" /> Export CSV
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div 
        className="bg-gradient-to-b from-[var(--orbit-bg-card)] to-[var(--color-orbit-void-900)] border border-[var(--orbit-border)] rounded-2xl overflow-hidden mt-2 shadow-xl"
        style={{ animation: 'fade-in-up 0.5s ease-out forwards', animationDelay: '0.15s', animationFillMode: 'backwards' }}
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[var(--color-orbit-void-950)]/50 border-b border-[var(--orbit-border)]/50">
              <TableRow className="border-transparent hover:bg-transparent">
                <TableHead className="text-[10px] font-mono tracking-widest uppercase text-[var(--orbit-text-secondary)] font-bold">Transaction</TableHead>
                <TableHead className="text-[10px] font-mono tracking-widest uppercase text-[var(--orbit-text-secondary)] font-bold">ID / Ledger Hash</TableHead>
                <TableHead className="text-[10px] font-mono tracking-widest uppercase text-[var(--orbit-text-secondary)] font-bold text-right">Amount</TableHead>
                <TableHead className="text-[10px] font-mono tracking-widest uppercase text-[var(--orbit-text-secondary)] font-bold">Status</TableHead>
                <TableHead className="text-[10px] font-mono tracking-widest uppercase text-[var(--orbit-text-secondary)] font-bold">Timestamp</TableHead>
                <TableHead className="text-[10px] font-mono tracking-widest uppercase text-[var(--orbit-text-secondary)] font-bold"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16 text-[var(--orbit-text-secondary)]">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-[var(--orbit-bg-elevated)] border border-[var(--orbit-border)] flex items-center justify-center mb-4">
                        <Wallet className="w-5 h-5 text-[var(--orbit-text-muted)]" />
                      </div>
                      <p className="font-semibold text-white">No ledger records found</p>
                      <p className="text-xs text-[var(--orbit-text-muted)] mt-1">Wallet records will populate here once transactions occur on the Stellar account.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map(tx => {
                  const isIncoming = ['DEPOSIT', 'TRANSFER_RECEIVED', 'WALLET_FUNDING'].includes(tx.type);
                  return (
                    <TableRow key={tx.id} className="border-[var(--orbit-border)]/50 hover:bg-white/[0.02] transition-colors">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(tx.type)}
                          <div>
                            <div className="font-bold text-white tracking-tight">{tx.type.replace('_', ' ')}</div>
                            <div className="text-[11px] text-[var(--orbit-text-muted)] font-medium">
                              {tx.type === 'WALLET_FUNDING' ? 'Added Funds' : 'Orbit Contribution'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="py-4">
                        <div className="text-xs font-mono text-white font-semibold max-w-[120px] truncate">{tx.id.split('-')[0]}...</div>
                        {tx.stellar_tx_hash && (
                          <div className="text-[10px] font-mono text-[var(--orbit-text-muted)] truncate max-w-[140px] mt-0.5" title={tx.stellar_tx_hash}>
                            Hash: {tx.stellar_tx_hash.substring(0, 10)}...
                          </div>
                        )}
                      </TableCell>
                      
                      <TableCell className="text-right py-4">
                        <span className={`font-mono font-bold text-[14px] ${isIncoming ? 'text-[var(--orbit-success)]' : 'text-amber-500'}`}>
                          {isIncoming ? '+' : '-'}{Number(tx.amount).toFixed(2)} <span className="text-[11px] font-sans text-[var(--orbit-text-muted)] font-semibold">{tx.currency}</span>
                        </span>
                      </TableCell>
                      
                      <TableCell className="py-4">
                        {getStatusBadge(tx.status)}
                      </TableCell>
                      
                      <TableCell className="text-[var(--orbit-text-secondary)] text-xs font-mono py-4">
                        {new Date(tx.created_at).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })}
                      </TableCell>
                      
                      <TableCell className="text-right py-4 pr-6">
                        <Sheet>
                          <SheetTrigger asChild>
                            <button className="text-[var(--orbit-brand-light)] hover:text-white text-xs font-bold transition-all px-3 py-1.5 rounded-lg border border-[var(--orbit-border)] hover:border-[var(--orbit-brand)] bg-[var(--color-orbit-void-900)]/85 hover:shadow-[0_0_10px_rgba(124,110,247,0.15)] inline-flex items-center gap-1 cursor-pointer">
                              Details <ArrowUpRight className="w-3 h-3 text-[var(--orbit-brand-light)]" />
                            </button>
                          </SheetTrigger>
                          <SheetContent className="bg-gradient-to-b from-[var(--color-orbit-void-850)] to-[var(--color-orbit-void-950)] border-l border-[var(--orbit-border)] text-white w-[400px] sm:w-[500px] shadow-2xl relative">
                            {/* Decorative spotlight radial beam */}
                            <div className="absolute top-[-50px] right-0 w-64 h-64 bg-[var(--orbit-brand)]/5 rounded-full blur-3xl pointer-events-none" />

                            <SheetHeader className="px-6 pt-6 pb-2 relative z-10">
                              <SheetTitle className="text-white text-xl font-black tracking-tight">Receipt Record</SheetTitle>
                            </SheetHeader>
                            
                            <div className="flex flex-col gap-6 px-6 pb-8 overflow-y-auto h-full relative z-10 mt-4">
                              {/* Large receipt details block */}
                              <div className="flex items-center justify-between p-5 bg-[var(--color-orbit-void-900)] border border-[var(--orbit-border)] rounded-xl relative overflow-hidden">
                                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--orbit-brand)] to-transparent" />
                                <div className="flex items-center gap-3">
                                  {getTypeIcon(tx.type)}
                                  <div className="font-bold text-white tracking-tight">{tx.type.replace('_', ' ')}</div>
                                </div>
                                <div className={`text-xl font-bold font-mono ${isIncoming ? 'text-[var(--orbit-success)]' : 'text-amber-500'}`}>
                                  {isIncoming ? '+' : '-'}{Number(tx.amount).toFixed(2)} {tx.currency}
                                </div>
                              </div>

                              <div className="space-y-5">
                                <div>
                                  <div className="text-[10px] text-[var(--orbit-text-muted)] mb-1.5 font-bold uppercase tracking-wider font-mono">Status</div>
                                  {getStatusBadge(tx.status)}
                                </div>
                                
                                <div>
                                  <div className="text-[10px] text-[var(--orbit-text-muted)] mb-1.5 font-bold uppercase tracking-wider font-mono">Transaction ID</div>
                                  <div className="flex items-center justify-between font-mono text-xs text-white bg-[var(--color-orbit-void-900)] p-3 rounded-xl border border-[var(--orbit-border)] break-all gap-3 select-all">
                                    <span>{tx.id}</span>
                                    <button 
                                      onClick={() => handleCopyText(tx.id, 'id')} 
                                      className="shrink-0 p-1.5 bg-[var(--orbit-bg-elevated)] border border-[var(--orbit-border)] rounded-lg hover:border-[var(--orbit-brand-border)] text-[var(--orbit-text-secondary)] hover:text-white transition-all cursor-pointer"
                                    >
                                      {copiedId === 'id' ? (
                                        <span className="text-[9px] uppercase font-bold text-[var(--orbit-success)] px-1">Copied</span>
                                      ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                                
                                <div>
                                  <div className="text-[10px] text-[var(--orbit-text-muted)] mb-1.5 font-bold uppercase tracking-wider font-mono">Timestamp</div>
                                  <div className="text-sm text-white font-semibold font-mono">{new Date(tx.created_at).toLocaleString()}</div>
                                </div>
                                
                                {tx.sender_address && (
                                  <div>
                                    <div className="text-[10px] text-[var(--orbit-text-muted)] mb-1.5 font-bold uppercase tracking-wider font-mono">Sender Address</div>
                                    <div className="flex items-center justify-between font-mono text-xs text-[var(--orbit-text-secondary)] bg-[var(--color-orbit-void-900)] p-3 rounded-xl border border-[var(--orbit-border)] break-all gap-3 select-all">
                                      <span>{tx.sender_address}</span>
                                      <button 
                                        onClick={() => handleCopyText(tx.sender_address, 'sender')} 
                                        className="shrink-0 p-1.5 bg-[var(--orbit-bg-elevated)] border border-[var(--orbit-border)] rounded-lg hover:border-[var(--orbit-brand-border)] text-[var(--orbit-text-secondary)] hover:text-white transition-all cursor-pointer"
                                      >
                                        {copiedId === 'sender' ? (
                                          <span className="text-[9px] uppercase font-bold text-[var(--orbit-success)] px-1">Copied</span>
                                        ) : (
                                          <Copy className="w-3.5 h-3.5" />
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                )}
                                
                                {tx.recipient_address && (
                                  <div>
                                    <div className="text-[10px] text-[var(--orbit-text-muted)] mb-1.5 font-bold uppercase tracking-wider font-mono">Recipient Address</div>
                                    <div className="flex items-center justify-between font-mono text-xs text-[var(--orbit-text-secondary)] bg-[var(--color-orbit-void-900)] p-3 rounded-xl border border-[var(--orbit-border)] break-all gap-3 select-all">
                                      <span>{tx.recipient_address}</span>
                                      <button 
                                        onClick={() => handleCopyText(tx.recipient_address, 'recipient')} 
                                        className="shrink-0 p-1.5 bg-[var(--orbit-bg-elevated)] border border-[var(--orbit-border)] rounded-lg hover:border-[var(--orbit-brand-border)] text-[var(--orbit-text-secondary)] hover:text-white transition-all cursor-pointer"
                                      >
                                        {copiedId === 'recipient' ? (
                                          <span className="text-[9px] uppercase font-bold text-[var(--orbit-success)] px-1">Copied</span>
                                        ) : (
                                          <Copy className="w-3.5 h-3.5" />
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                )}
                                
                                {tx.stellar_tx_hash && (
                                  <div>
                                    <div className="text-[10px] text-[var(--orbit-text-muted)] mb-1.5 font-bold uppercase tracking-wider font-mono">Stellar Ledger Hash</div>
                                    <div className="flex items-center justify-between font-mono text-xs text-[var(--orbit-brand-light)] bg-[var(--color-orbit-void-900)] p-3 rounded-xl border border-[var(--orbit-border)] break-all gap-3 select-all mb-3">
                                      <span>{tx.stellar_tx_hash}</span>
                                      <button 
                                        onClick={() => handleCopyText(tx.stellar_tx_hash, 'hash')} 
                                        className="shrink-0 p-1.5 bg-[var(--orbit-bg-elevated)] border border-[var(--orbit-border)] rounded-lg hover:border-[var(--orbit-brand-border)] text-[var(--orbit-text-secondary)] hover:text-white transition-all cursor-pointer"
                                      >
                                        {copiedId === 'hash' ? (
                                          <span className="text-[9px] uppercase font-bold text-[var(--orbit-success)] px-1">Copied</span>
                                        ) : (
                                          <Copy className="w-3.5 h-3.5" />
                                        )}
                                      </button>
                                    </div>
                                    
                                    <a 
                                      href={`https://stellar.expert/explorer/testnet/tx/${tx.stellar_tx_hash}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all px-4 h-10 rounded-xl cursor-pointer w-full"
                                    >
                                      View on Explorer <ExternalLink className="w-3.5 h-3.5 text-[var(--orbit-brand-light)]" />
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          </SheetContent>
                        </Sheet>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
