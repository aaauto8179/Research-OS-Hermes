"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Copy, Zap, FileText, MessageSquare, XCircle } from "lucide-react";

interface AIAssistantProps {
  documentId?: string;
  companySymbol?: string;
}

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  citations?: any[];
  timestamp: Date;
}

const SYSTEM_PROMPT = `You are an expert financial analyst AI assistant. You have access to parsed financial documents (annual reports, concall transcripts, investor presentations, quarterly results). Answer questions based ONLY on the provided document context. Always cite page numbers when referencing specific data. If information is not in the documents, say so clearly.`;

const MOCK_RESPONSES: Record<string, { content: string; citations: any[] }> = {
  "revenue": {
    content: "Based on the Q4 FY24 concall transcript (page 12) and annual report (page 15), Reliance Industries reported consolidated revenue of ₹2,40,000 Cr for Q4 FY24, growing 12% YoY. The O2C segment contributed ₹1,45,000 Cr, Retail ₹72,000 Cr, and Jio ₹38,000 Cr.",
    citations: [{ page: 12, text: "Consolidated revenue for Q4 FY24 stood at ₹2,40,000 Cr" }, { page: 15, text: "O2C segment revenue at ₹1,45,000 Cr" }],
  },
  "ebitda": {
    content: "Consolidated EBITDA for Q4 FY24 was ₹45,000 Cr (page 15, annual report), up 15% YoY. O2C EBITDA per barrel improved to $13.2 from $11.8 (page 15). Retail EBITDA margin expanded to 8.5% from 7.2% (page 28).",
    citations: [{ page: 15, text: "O2C EBITDA per barrel improved to $13.2" }, { page: 28, text: "Retail EBITDA margin expanded to 8.5%" }],
  },
  "guidance": {
    content: "Management guided for FY25: Revenue growth 12-15% (page 8, concall), EBITDA margin 18-20% (page 8), Capex ₹1.2L Cr with focus on new energy (page 9). Retail store addition target of 2,500+ stores (page 10).",
    citations: [{ page: 8, text: "Revenue growth guidance 12-15% for FY25" }, { page: 9, text: "Capex guidance ₹1.2L Cr" }],
  },
  "debt": {
    content: "Net debt reduced to ₹50,000 Cr from ₹75,000 Cr YoY (page 22, annual report). Debt-to-equity improved to 0.35 from 0.55. Interest coverage ratio at 4.2x (page 18).",
    citations: [{ page: 22, text: "Net debt reduced to ₹50,000 Cr" }, { page: 18, text: "Interest coverage ratio at 4.2x" }],
  },
  "risks": {
    content: "Key risks identified: 1) Global recession risk impacting O2C demand (page 35), 2) Regulatory changes in telecom tariffs (page 36), 3) New energy execution risk at scale (page 37), 4) Crude price volatility affecting refining margins.",
    citations: [{ page: 35, text: "Global recession risk impacting O2C demand" }, { page: 36, text: "Regulatory changes in telecom tariffs" }],
  },
};

export default function AIAssistant({ documentId = "1", companySymbol = "RELIANCE" }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "system", content: SYSTEM_PROMPT, timestamp: new Date() },
    { role: "assistant", content: `Hello! I'm your AI financial analyst assistant for ${companySymbol} (Doc #${documentId}). I can answer questions about financial metrics, guidance, segment performance, risks, and more based on the parsed documents. What would you like to know?`, timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    "What was Q4 FY24 revenue?",
    "Show me EBITDA breakdown by segment",
    "What is management's FY25 guidance?",
    "What are the key risks?",
    "How much did net debt reduce?",
  ]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const findMatchingResponse = (query: string) => {
    const lower = query.toLowerCase();
    if (lower.includes("revenue") || lower.includes("sales")) return MOCK_RESPONSES.revenue;
    if (lower.includes("ebitda") || lower.includes("margin")) return MOCK_RESPONSES.ebitda;
    if (lower.includes("guidance") || lower.includes("outlook") || lower.includes("fy25")) return MOCK_RESPONSES.guidance;
    if (lower.includes("debt") || lower.includes("leverage") || lower.includes("borrow")) return MOCK_RESPONSES.debt;
    if (lower.includes("risk") || lower.includes("concern") || lower.includes("challenge")) return MOCK_RESPONSES.risks;
    return null;
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage: Message = { role: "user", content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    const query = input;
    setInput("");
    setLoading(true);

    // Simulate API call
    await new Promise(r => setTimeout(r, 1000));
    
    const match = findMatchingResponse(query);
    const response: Message = {
      role: "assistant",
      content: match?.content || "I don't have specific information about that in the parsed documents. Please try asking about revenue, EBITDA, guidance, debt, or risks.",
      citations: match?.citations || [],
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, response]);
    setLoading(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    handleSend();
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>AI Assistant — Doc #{documentId}</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {messages.filter(m => m.role === "user").length} questions
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        {/* Chat History */}
        <ScrollArea className="flex-1 overflow-y-auto pr-2" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.filter(m => m.role !== "system").map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none"}`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  {msg.citations && msg.citations.length > 0 && (
                    <details className="mt-2">
                      <summary className="text-xs text-muted-foreground/70 cursor-pointer">Citations ({msg.citations.length})</summary>
                      <div className="mt-1 space-y-1">
                        {msg.citations.map((c: any, ci: number) => (
                          <div key={ci} className="flex items-start gap-1 text-xs text-muted-foreground">
                            <span className="shrink-0">p.{c.page}:</span>
                            <span className="flex-1">{c.text}</span>
                            <Button variant="ghost" size="icon" className="h-5 w-5 p-0" onClick={() => handleCopy(c.text)} title="Copy">
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-2xl rounded-bl-none flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Analyzing documents...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Suggestions */}
        {messages.length <= 2 && (
          <div className="mb-3 space-y-2">
            <p className="text-xs text-muted-foreground">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, i) => (
                <Button key={i} variant="outline" size="sm" className="text-xs" onClick={() => handleSuggestionClick(s)}>
                  {s}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Ask about financials, guidance, risks..."
            disabled={loading}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={loading || !input.trim()} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}