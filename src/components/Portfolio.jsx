import React, { useState, useMemo, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Wallet, Plus, Trash2, ArrowUpRight, ArrowDownRight, ShieldAlert, CheckCircle2, Upload, Download, Target, FileText, Activity, Landmark, Sparkles, AlertTriangle, ChevronDown, ChevronUp, Edit2, Save } from 'lucide-react';
import { stockMetadataMap, mutualFundMetadataMap, commodityMetadataMap, cryptoMetadataMap } from '../App';
import * as XLSX from 'xlsx';

const getMetadataMapForCategory = (category) => {
  switch (category) {
    case 'Mutual Funds': return mutualFundMetadataMap;
    case 'Commodities': return commodityMetadataMap;
    case 'Cryptocurrency': return cryptoMetadataMap;
    default: return stockMetadataMap;
  }
};

const COLORS = ['#2563eb', '#10b981', '#fb923c', '#e11d48', '#a855f7', '#06b6d4'];

const initialDefaultHoldings = [
  { id: 1, name: "Reliance Industries", symbol: "RELIANCE", category: "Equity", sector: "Conglomerate", quantity: 15, buyPrice: 2380.00, broker: "Zerodha", buyDate: "2025-06-12" },
  { id: 2, name: "HDFC Bank Ltd", symbol: "HDFCBANK", category: "Equity", sector: "Banking", quantity: 30, buyPrice: 1500.00, broker: "Groww", buyDate: "2025-08-15" },
  { id: 3, name: "Parag Parikh Flexi Cap", symbol: "PPFLEXI", category: "Mutual Funds", sector: "Diversified", quantity: 1, buyPrice: 30000.00, broker: "Direct", buyDate: "2024-12-10" },
  { id: 4, name: "Gold ETF Bees", symbol: "GOLD", category: "Commodities", sector: "Gold", quantity: 50, buyPrice: 5000.00, broker: "Zerodha", buyDate: "2025-01-20" },
  { id: 5, name: "Bitcoin", symbol: "BTC/USD", category: "Cryptocurrency", sector: "Crypto", quantity: 0.15, buyPrice: 4800000.00, broker: "CoinDCX", buyDate: "2025-04-05" }
];

const initialGoals = [
  { id: 1, name: "Retirement corpus", targetAmount: 20000000, currentSaved: 350000, targetYear: 2045, category: "Equity" },
  { id: 2, name: "House down payment", targetAmount: 2500000, currentSaved: 120000, targetYear: 2030, category: "Mutual Funds" }
];

const Portfolio = ({ user, marketData = {} }) => {
  const [activeSubTab, setActiveSubTab] = useState('ledger'); // 'ledger', 'diagnostics', 'goals', 'coach'
  const [holdings, setHoldings] = useState(() => {
    try {
      const cached = localStorage.getItem(`Prefin_holdings_${user?.id || 'default'}`);
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });

  const [goals, setGoals] = useState(() => {
    try {
      const cached = localStorage.getItem(`Prefin_goals_${user?.id || 'default'}`);
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });

  const [purchaseLotsHistory, setPurchaseLotsHistory] = useState(() => {
    try {
      const cached = localStorage.getItem(`Prefin_purchase_lots_${user?.id || 'default'}`);
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });

  const [salesHistory, setSalesHistory] = useState(() => {
    try {
      const cached = localStorage.getItem(`Prefin_sales_history_${user?.id || 'default'}`);
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });

  const [holdingsFilter, setHoldingsFilter] = useState('All');

  const [expandedHoldingId, setExpandedHoldingId] = useState(null);
  const [editingLotId, setEditingLotId] = useState(null);
  const [editLotQty, setEditLotQty] = useState('');

  const [sellDate, setSellDate] = useState(new Date().toISOString().split('T')[0]);
  const [sellQuantity, setSellQuantity] = useState('');
  const [sellPrice, setSellPrice] = useState('');

  // Form states for manual asset logging
  const [newName, setNewName] = useState('');
  const [newSymbol, setNewSymbol] = useState('');
  const [newCategory, setNewCategory] = useState('Equity');
  const [newSector, setNewSector] = useState('Banking');
  const [newBroker, setNewBroker] = useState('Zerodha');
  const [lots, setLots] = useState([{ id: Date.now(), date: '', quantity: '', price: '' }]);

  useEffect(() => {
    localStorage.setItem(`Prefin_holdings_${user?.id || 'default'}`, JSON.stringify(holdings));
  }, [holdings, user]);

  useEffect(() => {
    localStorage.setItem(`Prefin_purchase_lots_${user?.id || 'default'}`, JSON.stringify(purchaseLotsHistory));
  }, [purchaseLotsHistory, user]);

  useEffect(() => {
    localStorage.setItem(`Prefin_sales_history_${user?.id || 'default'}`, JSON.stringify(salesHistory));
  }, [salesHistory, user]);

  const generateMockHistoricalPrice = (symbol, dateStr) => {
    if (!symbol || !dateStr) return '';
    let hash = 0;
    const str = `${symbol}-${dateStr}`;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const basePrice = Math.abs(hash % 4900) + 100;
    return parseFloat((basePrice + (Math.abs(hash % 100) / 100)).toFixed(2));
  };

  const handleLotChange = (id, field, value) => {
    setLots(prev => prev.map(lot => {
      if (lot.id === id) {
        const updatedLot = { ...lot, [field]: value };
        if (field === 'date' && value) {
            const autoPrice = generateMockHistoricalPrice(newSymbol || newName, value);
            if (autoPrice) updatedLot.price = autoPrice;
        }
        return updatedLot;
      }
      return lot;
    }));
  };

  const addLot = () => {
    setLots(prev => [...prev, { id: Date.now(), date: '', quantity: '', price: '' }]);
  };

  const removeLot = (id) => {
    setLots(prev => prev.filter(l => l.id !== id));
  };

  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [symbolSuggestions, setSymbolSuggestions] = useState([]);

  const handleNameChange = (e) => {
    const val = e.target.value;
    setNewName(val);
    if (val.length > 0) {
      const map = getMetadataMapForCategory(newCategory);
      const suggestions = Object.entries(map)
        .filter(([symbol, data]) => data.name.toLowerCase().includes(val.toLowerCase()) || symbol.toLowerCase().includes(val.toLowerCase()))
        .map(([symbol, data]) => ({ symbol, ...data }));
      setNameSuggestions(suggestions);
    } else {
      setNameSuggestions([]);
    }
  };

  const handleSymbolChange = (e) => {
    const val = e.target.value;
    setNewSymbol(val);
    if (val.length > 0) {
      const map = getMetadataMapForCategory(newCategory);
      const suggestions = Object.entries(map)
        .filter(([symbol, data]) => symbol.toLowerCase().includes(val.toLowerCase()) || data.name.toLowerCase().includes(val.toLowerCase()))
        .map(([symbol, data]) => ({ symbol, ...data }));
      setSymbolSuggestions(suggestions);
    } else {
      setSymbolSuggestions([]);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    setNewName(suggestion.name);
    setNewSymbol(suggestion.symbol);
    // Keep the currently selected category — don't override it
    
    const sectorMapping = {
        'Banking': 'Banking',
        'Finance': 'Banking',
        'IT Services': 'IT Services',
        'Conglomerate': 'Conglomerate',
        'Metals': 'Metals',
        'Retail': 'Retail',
        'Consumer Goods': 'Retail',
        'Automobile': 'Retail',
        'Pharmaceuticals': 'Retail',
        'Healthcare': 'Retail',
        'Energy': 'Conglomerate',
        'Power': 'Conglomerate',
        'Infrastructure': 'Conglomerate',
        'Telecom': 'IT Services',
        'Defense': 'Government',
        'Materials': 'Metals',
        'Large Cap': 'Banking',
        'Mid Cap': 'Banking',
        'Small Cap': 'Banking',
        'Index Fund': 'Banking',
        'Flexi Cap': 'Banking',
        'Multi Cap': 'Banking',
        'ELSS': 'Government',
        'Sectoral': 'IT Services',
        'Focused': 'Banking',
        'Hybrid': 'Banking',
        'Liquid': 'Government',
        'Precious Metals': 'Gold',
        'Base Metals': 'Metals',
        'Agriculture': 'Retail',
        'Crypto': 'Crypto'
    };
    const mappedSector = sectorMapping[suggestion.sector] || 'Conglomerate';
    setNewSector(mappedSector);

    // Try live price from marketData, then from metadata map
    const liveFromFeed = marketData && marketData[suggestion.symbol]?.price;
    const liveFromMeta = suggestion.livePrice || suggestion.nav;
    if (liveFromFeed) {
        setLots(prev => prev.map((l, i) => i === 0 ? { ...l, price: liveFromFeed } : l));
    } else if (liveFromMeta) {
        setLots(prev => prev.map((l, i) => i === 0 ? { ...l, price: liveFromMeta } : l));
    } else {
        setLots(prev => prev.map((l, i) => i === 0 ? { ...l, price: '' } : l));
    }

    setNameSuggestions([]);
    setSymbolSuggestions([]);
  };

  // Form states for Goal creation
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalYear, setGoalYear] = useState('');
  const [goalCategory, setGoalCategory] = useState('Equity');

  // File Uploading states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');

  // Wealth Coach States
  const [selectedReport, setSelectedReport] = useState('');
  const [reportContent, setReportContent] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // PDF Export Modal State
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Persist State Updates
  useEffect(() => {
    localStorage.setItem(`Prefin_holdings_${user?.id || 'default'}`, JSON.stringify(holdings));
  }, [holdings, user]);

  useEffect(() => {
    localStorage.setItem(`Prefin_goals_${user?.id || 'default'}`, JSON.stringify(goals));
  }, [goals, user]);

  useEffect(() => {
    localStorage.setItem(`Prefin_purchase_lots_${user?.id || 'default'}`, JSON.stringify(purchaseLotsHistory));
  }, [purchaseLotsHistory, user]);

  // Resolve Live Prices & Metric Calculations
  const processedHoldings = useMemo(() => {
    return holdings.map(h => {
      let currentPrice = h.buyPrice; // fallback

      // Map dynamic live feed data
      if (h.symbol && marketData[h.symbol]?.price != null) {
        currentPrice = marketData[h.symbol].price;
      } else if (h.symbol === 'RELIANCE' && marketData['RELIANCE']?.price != null) {
        currentPrice = marketData['RELIANCE'].price;
      } else if (h.symbol === 'GOLD' && marketData['GOLD']?.price != null) {
        currentPrice = marketData['GOLD'].price;
      } else {
        // Mock slight variations for items not on direct index feed (e.g. PPFLEXI, BTC)
        const hash = h.id % 10;
        const multiplier = 1 + (hash * 0.03) - 0.05; // -5% to +25%
        currentPrice = h.buyPrice * multiplier;
      }

      const invested = h.buyPrice * h.quantity;
      const current = currentPrice * h.quantity;
      const pl = current - invested;
      const plPct = invested > 0 ? (pl / invested) * 100 : 0;

      // AI recommendation tags
      let recommendation = 'HOLD';
      let reason = 'Strong fundamentals and stable sector valuation support long-term compounding.';

      if (h.category === 'Cryptocurrency') {
        recommendation = 'PARTIAL PROFIT BOOKING';
        reason = 'Cryptocurrency volatility metrics are expanding. Realize gains to secure stable indices.';
      } else if (h.symbol === 'HDFCBANK') {
        recommendation = 'HOLD';
        reason = 'Attractive valuations relative to peer banks post-merger consolidate core support.';
      } else if (h.symbol === 'RELIANCE') {
        recommendation = 'BUY MORE';
        reason = 'Green energy scaling models and Jio telecom price gains signal strong growth triggers.';
      } else if (plPct < -12) {
        recommendation = 'WATCH CLOSELY';
        reason = 'Asset drawdown has exceeded standard deviation boundaries. Monitor support ranges.';
      } else if (plPct > 35) {
        recommendation = 'PARTIAL PROFIT BOOKING';
        reason = 'Overstretched short-term momentum; secure a 20% gain and reallocate to debt indices.';
      }

      return {
        ...h,
        currentPrice,
        invested,
        current,
        pl,
        plPct,
        recommendation,
        reason
      };
    });
  }, [holdings, marketData]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    let totalInvested = 0;
    let totalCurrent = 0;
    const sectorTotals = {};
    const categoryTotals = {};

    let highestGainer = null;
    let highestLoser = null;

    processedHoldings.forEach(h => {
      totalInvested += h.invested;
      totalCurrent += h.current;

      sectorTotals[h.sector] = (sectorTotals[h.sector] || 0) + h.current;
      categoryTotals[h.category] = (categoryTotals[h.category] || 0) + h.current;

      if (!highestGainer || h.pl > highestGainer.pl) {
        highestGainer = h;
      }
      if (!highestLoser || h.pl < highestLoser.pl) {
        highestLoser = h;
      }
    });

    const absolutePl = totalCurrent - totalInvested;
    const plPercentage = totalInvested > 0 ? (absolutePl / totalInvested) * 100 : 0;

    // Find best and weakest sectors based on holdings allocation
    let bestSector = 'N/A';
    let weakestSector = 'N/A';
    let highestSectorVal = -1;
    let lowestSectorVal = Infinity;

    Object.keys(sectorTotals).forEach(sec => {
      if (sectorTotals[sec] > highestSectorVal) {
        highestSectorVal = sectorTotals[sec];
        bestSector = sec;
      }
      if (sectorTotals[sec] < lowestSectorVal) {
        lowestSectorVal = sectorTotals[sec];
        weakestSector = sec;
      }
    });

    return {
      totalInvested,
      totalCurrent,
      absolutePl,
      plPercentage,
      sectorTotals,
      categoryTotals,
      highestGainer,
      highestLoser,
      bestSector,
      weakestSector
    };
  }, [processedHoldings]);

  // Portfolio Health Score calculation (0 - 100)
  const healthScore = useMemo(() => {
    if (processedHoldings.length === 0) return 0;
    let score = 100;

    // 1. Diversification categories check
    const categoriesCount = Object.keys(metrics.categoryTotals).length;
    if (categoriesCount < 3) score -= 15;
    else if (categoriesCount < 4) score -= 5;

    // 2. Crypto concentration check (speculative weight limit 20%)
    const cryptoTotal = metrics.categoryTotals['Cryptocurrency'] || 0;
    const cryptoPct = metrics.totalCurrent > 0 ? (cryptoTotal / metrics.totalCurrent) * 100 : 0;
    if (cryptoPct > 20) score -= 20;
    else if (cryptoPct > 10) score -= 10;

    // 3. Single sector concentration check (industry risk limit 45%)
    Object.keys(metrics.sectorTotals).forEach(sec => {
      const secPct = metrics.totalCurrent > 0 ? (metrics.sectorTotals[sec] / metrics.totalCurrent) * 100 : 0;
      if (secPct > 45) score -= 15;
    });

    // 4. Quantity of holdings health check
    if (processedHoldings.length < 4) score -= 10;

    return Math.max(10, Math.min(100, score));
  }, [processedHoldings, metrics]);

  const healthGrade = useMemo(() => {
    if (healthScore >= 85) return { rating: 'Excellent', color: 'var(--success)', msg: 'Perfect balance of growth asset compound potential and currency safety.' };
    if (healthScore >= 65) return { rating: 'Moderate Skew', color: '#fb923c', msg: 'Core allocations show concentration issues. Diversify speculative tokens.' };
    return { rating: 'Action Required', color: 'var(--danger)', msg: 'High volatility exposure detected. Reallocate proceeds into stable sovereign bonds.' };
  }, [healthScore]);

  // Real statement parsing handler
  const handleStatementUpload = (e) => {
    e.preventDefault();
    const file = e.target.files ? e.target.files[0] : (e.dataTransfer && e.dataTransfer.files ? e.dataTransfer.files[0] : null);
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(20);
    setUploadStatus('Reading file data...');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        setUploadProgress(50);
        setUploadStatus('Parsing spreadsheet structure...');
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to array of objects
        const jsonRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        
        setUploadProgress(75);
        setUploadStatus('Extracting holdings from rows...');

        const importedHoldings = [];

        jsonRows.forEach((row, index) => {
          // Find key mapping regardless of case or spaces
          const findKey = (possibleNames) => {
            const rowKeys = Object.keys(row);
            for (let p of possibleNames) {
              const matchedKey = rowKeys.find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === p.toLowerCase().replace(/[^a-z0-9]/g, ''));
              if (matchedKey) return row[matchedKey];
            }
            return null;
          };

          const rawName = findKey(['Name', 'Asset', 'Fund', 'Stock', 'Scheme', 'Description']) || 'Unknown Asset';
          const rawSymbol = findKey(['Symbol', 'Ticker', 'ISIN', 'Code']) || rawName.substring(0, 8).toUpperCase();
          const rawQuantity = findKey(['Quantity', 'Qty', 'Units', 'Balance']) || 0;
          const rawPrice = findKey(['Price', 'Buy Price', 'Avg Cost', 'Average Cost', 'NAV', 'Cost']) || 0;
          const rawCategory = findKey(['Category', 'Asset Class', 'Type']);
          const rawSector = findKey(['Sector', 'Industry']) || 'Diversified';
          const rawBroker = findKey(['Broker', 'Platform']) || 'Statement Import';
          const rawDate = findKey(['Date', 'Buy Date', 'Purchase Date']) || new Date().toISOString().split('T')[0];

          // Auto-detect category if missing
          let parsedCategory = 'Equity';
          if (rawCategory) parsedCategory = rawCategory;
          else if (rawName.toLowerCase().includes('fund') || rawName.toLowerCase().includes('etf')) parsedCategory = 'Mutual Funds';

          const numQty = parseFloat(rawQuantity) || 0;
          const numPrice = parseFloat(rawPrice) || 0;

          if (numQty > 0 || numPrice > 0) {
            importedHoldings.push({
              id: Date.now() + index,
              name: String(rawName).trim(),
              symbol: String(rawSymbol).trim(),
              category: parsedCategory,
              sector: rawSector,
              quantity: numQty,
              buyPrice: numPrice,
              broker: rawBroker,
              buyDate: String(rawDate)
            });
          }
        });

        setTimeout(() => {
          if (importedHoldings.length > 0) {
            setHoldings(prevHoldings => {
              // Simple duplicate prevention based on symbol (can be removed if they want multiple entries per symbol)
              const uniqueImports = importedHoldings.filter(ih => !prevHoldings.some(ph => ph.symbol === ih.symbol));
              return [...prevHoldings, ...uniqueImports];
            });
            setUploadStatus(`Success! Imported ${importedHoldings.length} assets.`);
          } else {
            setUploadStatus('No valid holdings found in the file. Check column headers.');
          }

          setUploadProgress(100);
          
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
            setUploadStatus('');
          }, 2000);
        }, 500);

      } catch (err) {
        console.error("Error parsing file:", err);
        setUploadStatus('Error reading file. Ensure it is a valid Excel/CSV.');
        setTimeout(() => setIsUploading(false), 3000);
      }
    };
    reader.onerror = () => {
      setUploadStatus('Error reading file.');
      setTimeout(() => setIsUploading(false), 3000);
    };
    
    reader.readAsArrayBuffer(file);
    
    // Clear input so same file can be uploaded again if needed
    if (e.target.value) e.target.value = '';
  };

  // Add holding manually
  const handleAddHolding = (e) => {
    e.preventDefault();
    if (!newName) return;

    const today = new Date().toISOString().split('T')[0];
    const validLots = lots.filter(l => {
      const dateValid = !l.date || l.date <= today;
      return l.quantity && l.price && dateValid;
    });

    if (validLots.length === 0) {
      alert("Please ensure you have valid lots. Future dates, zero quantities or prices are not allowed.");
      return;
    }

    let totalQuantity = 0;
    let totalValue = 0;
    
    const finalSymbol = newSymbol.toUpperCase() || newName.substring(0, 5).toUpperCase();
    const newLotRecords = validLots.map((lot, index) => {
        const qty = Number(lot.quantity);
        const price = Number(lot.price);
        totalQuantity += qty;
        totalValue += (qty * price);
        
        return {
            lotId: Date.now() + index,
            holdingSymbol: finalSymbol,
            purchaseDate: lot.date || today,
            quantity: qty,
            buyPrice: price
        };
    });

    const averageBuyPrice = totalQuantity > 0 ? (totalValue / totalQuantity) : 0;

    setHoldings(prev => {
        const existingIdx = prev.findIndex(h => h.symbol === finalSymbol);
        
        if (existingIdx !== -1) {
            const updatedHoldings = [...prev];
            const existing = updatedHoldings[existingIdx];
            
            const newTotalQty = existing.quantity + totalQuantity;
            const existingValue = existing.quantity * existing.buyPrice;
            const newTotalValue = existingValue + totalValue;
            
            updatedHoldings[existingIdx] = {
                ...existing,
                quantity: newTotalQty,
                buyPrice: newTotalValue / newTotalQty,
            };
            return updatedHoldings;
        } else {
            const newH = {
              id: Date.now(),
              name: newName,
              symbol: finalSymbol,
              category: newCategory,
              sector: newSector,
              quantity: totalQuantity,
              buyPrice: averageBuyPrice,
              broker: newBroker,
              buyDate: validLots[0].date || today
            };
            return [...prev, newH];
        }
    });

    setPurchaseLotsHistory(prev => [...prev, ...newLotRecords]);

    setNewName('');
    setNewSymbol('');
    setLots([{ id: Date.now(), date: '', quantity: '', price: '' }]);
  };

  // Delete holding
  const handleDeleteHolding = (id) => {
    const holdingToDelete = holdings.find(h => h.id === id);
    if (holdingToDelete) {
        setPurchaseLotsHistory(prev => prev.filter(lot => lot.holdingSymbol !== holdingToDelete.symbol));
    }
    setHoldings(prev => prev.filter(h => h.id !== id));
  };

  // Update/Sell lot
  const handleUpdateLotQuantity = (lotId, symbol) => {
    const newQty = Number(editLotQty);
    if (isNaN(newQty) || newQty < 0) return;

    let updatedLots = [...purchaseLotsHistory];
    const lotIndex = updatedLots.findIndex(l => l.lotId === lotId);
    if (lotIndex === -1) return;

    if (newQty === 0) {
      updatedLots.splice(lotIndex, 1);
    } else {
      updatedLots[lotIndex].quantity = newQty;
    }

    setPurchaseLotsHistory(updatedLots);
    setEditingLotId(null);
    setEditLotQty('');

    // Recalculate holding
    const symbolLots = updatedLots.filter(l => l.holdingSymbol === symbol);
    if (symbolLots.length === 0) {
      // no lots left, delete holding
      setHoldings(prev => prev.filter(h => h.symbol !== symbol));
      if (expandedHoldingId === holdings.find(h => h.symbol === symbol)?.id) {
        setExpandedHoldingId(null);
      }
    } else {
      let totalQty = 0;
      let totalVal = 0;
      symbolLots.forEach(l => {
        totalQty += l.quantity;
        totalVal += (l.quantity * l.buyPrice);
      });
      const avgPrice = totalVal / totalQty;
      setHoldings(prev => prev.map(h => {
        if (h.symbol === symbol) {
          return { ...h, quantity: totalQty, buyPrice: avgPrice };
        }
        return h;
      }));
    }
  };

  // Handle recording a sale
  const handleRecordSale = (symbol) => {
    const sQty = Number(sellQuantity);
    const sPrice = Number(sellPrice);
    
    if (isNaN(sQty) || sQty <= 0 || isNaN(sPrice) || sPrice < 0 || !sellDate) {
      alert("Please enter valid sale details.");
      return;
    }

    const symbolLots = purchaseLotsHistory.filter(l => l.holdingSymbol === symbol);
    const totalAvailQty = symbolLots.reduce((acc, l) => acc + l.quantity, 0);

    if (sQty > totalAvailQty) {
      alert(`Cannot sell more than available quantity (${totalAvailQty}).`);
      return;
    }

    // Sort lots chronologically (oldest first)
    symbolLots.sort((a, b) => new Date(a.purchaseDate) - new Date(b.purchaseDate));

    let remainingToSell = sQty;
    let totalCostBasis = 0;
    let updatedLots = [...purchaseLotsHistory];

    for (let lot of symbolLots) {
      if (remainingToSell <= 0) break;
      
      const lotIndex = updatedLots.findIndex(l => l.lotId === lot.lotId);
      if (lotIndex === -1) continue;

      if (lot.quantity <= remainingToSell) {
        totalCostBasis += (lot.quantity * lot.buyPrice);
        remainingToSell -= lot.quantity;
        updatedLots.splice(lotIndex, 1);
      } else {
        totalCostBasis += (remainingToSell * lot.buyPrice);
        updatedLots[lotIndex].quantity -= remainingToSell;
        remainingToSell = 0;
      }
    }

    const totalRealizedValue = sQty * sPrice;
    const realizedPL = totalRealizedValue - totalCostBasis;

    const newSaleRecord = {
      id: Date.now(),
      symbol,
      sellDate,
      quantity: sQty,
      sellPrice: sPrice,
      realizedPL
    };

    setSalesHistory(prev => [...prev, newSaleRecord]);
    setPurchaseLotsHistory(updatedLots);

    const newSymbolLots = updatedLots.filter(l => l.holdingSymbol === symbol);
    if (newSymbolLots.length === 0) {
      setHoldings(prev => prev.filter(h => h.symbol !== symbol));
      if (expandedHoldingId === holdings.find(h => h.symbol === symbol)?.id) {
        setExpandedHoldingId(null);
      }
    } else {
      let tQty = 0;
      let tVal = 0;
      newSymbolLots.forEach(l => {
        tQty += l.quantity;
        tVal += (l.quantity * l.buyPrice);
      });
      const avgPrice = tVal / tQty;
      setHoldings(prev => prev.map(h => h.symbol === symbol ? { ...h, quantity: tQty, buyPrice: avgPrice } : h));
    }

    setSellQuantity('');
    setSellPrice('');
  };

  // Add target financial goal
  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!goalName || !goalTarget || !goalYear) return;

    const newG = {
      id: Date.now(),
      name: goalName,
      targetAmount: Number(goalTarget),
      currentSaved: 0,
      targetYear: Number(goalYear),
      category: goalCategory
    };

    setGoals(prev => [...prev, newG]);
    setGoalName('');
    setGoalTarget('');
    setGoalYear('');
  };

  // Delete Goal
  const handleDeleteGoal = (id) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  // AI Daily Wealth Coach briefs generator
  const handleGenerateCoachReport = (reportType) => {
    setIsGeneratingReport(true);
    setSelectedReport(reportType);
    setReportContent('');

    setTimeout(() => {
      const activeNifty = marketData['NIFTY 50']?.price ? marketData['NIFTY 50'].price.toFixed(2) : '24,013.10';
      const activeNiftyChangeText = marketData['NIFTY 50']?.change ? `${marketData['NIFTY 50'].change >= 0 ? '+' : ''}${marketData['NIFTY 50'].change.toFixed(2)}%` : '-0.64%';
      
      let reportStr = '';
      if (reportType === 'morning') {
        reportStr = `### Summary\n**Morning Briefing (Live Opening)**: Global indices indicate positive domestic opening cues with Gift Nifty trending up. Our live indicators show NIFTY 50 sits at **${activeNifty}** (${activeNiftyChangeText}).\n\n### Analysis\nYour portfolio is highly active across Banking and Commodities. Keep a close watch on **HDFC Bank** opening volumes as index options expire today. Banking spreads are consolidating, and immediate support levels for Nifty 50 are anchored firmly at 23,850.\n\n### Advantages\nSovereign gold and flexi-cap mutual funds provide defense overlays, cushioning your capital if global currency feeds experience volatility during forex hours.\n\n### Risks\nHigh speculative cryptocurrency tokens (BTC comprises ${((metrics.categoryTotals['Cryptocurrency'] || 0) / metrics.totalCurrent * 100).toFixed(1)}% of wealth) pose early-morning drawdown risks if overseas exchanges drop.\n\n### Suggested Action\nMaintain index SIP directives. Avoid chasing initial opening surges; save cash reserves for late-afternoon pullbacks.`;
      } else if (reportType === 'evening') {
        reportStr = `### Summary\n**Evening Summary (Market Close)**: The exchange completes today's cycle. NIFTY 50 closed at **${activeNifty}** (${activeNiftyChangeText}).\n\n### Analysis\nYour total current portfolio value completed trading at **₹${metrics.totalCurrent.toLocaleString('en-IN', { maximumFractionDigits: 2 })}**, generating an absolute change of **₹${(metrics.absolutePl).toLocaleString('en-IN', { maximumFractionDigits: 2 })}** (${metrics.plPercentage.toFixed(2)}% net yield).\n\n### Advantages\nDiversified flexi-cap assets captured market gains, beating sector underperformance.\n\n### Risks\nPSU and steel commodities encountered profit locking late in the session, creating minor momentum drags.\n\n### Suggested Action\nConfirm transaction records have synchronized correctly. Continue monthly allocations.`;
      } else if (reportType === 'weekly') {
        reportStr = `### Summary\n**Weekly Advisory Brief**: High institutional rotation occurred this week, causing indices to consolidate near critical support zones.\n\n### Analysis\nNifty P/E valuation remains near 23x. Sector review suggests allocating more capital towards defense and IT indices while banking consolidates. Your health score is **${healthScore}/100**, indicating a strong core setup with minor concentration warnings.\n\n### Advantages\nDisciplined rupee cost averaging keeps your average acquisition costs low.\n\n### Risks\nSpeculative asset weights remain elevated relative to AAA fixed income bounds.\n\n### Suggested Action\nInitiate a partial rebalancing. Book 15% profits from high-momentum crypto allocations and redirect them into liquid large-cap Index ETFs.`;
      } else {
        reportStr = `### Summary\n**Monthly Wealth Summary**: Reviewing compound interest curves and asset allocations over the past 30 days.\n\n### Analysis\nYour capital reserves compiled an estimated wealth return of **${metrics.plPercentage.toFixed(2)}%**. The portfolio allocation shows equity holdings are driving primary returns, supported by commodity hedges.\n\n### Advantages\nConsistent SIP allocations have maximized compound interest scaling across key direct funds.\n\n### Risks\nHigh inflation levels continue to decay low-yield cash accounts.\n\n### Suggested Action\nReview goals dashboard. Set up a step-up SIP to lock in higher targets for retirement and downpayment plans.`;
      }

      setReportContent(reportStr);
      setIsGeneratingReport(false);
    }, 1200);
  };

  // Mock PDF Exporter download animation trigger
  const handleExportPDF = () => {
    setShowExportModal(true);
    setExportProgress(10);

    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            setShowExportModal(false);
            setExportProgress(0);
            
            // Create mock file download trigger
            const blob = new Blob([`Prefin Wealth Report\nHealth Score: ${healthScore}/100\nTotal Valuation: ₹${metrics.totalCurrent.toLocaleString()}\n${disclaimer}`], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Prefin_wealth_report_${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 800);
          return 100;
        }
        return prev + 30;
      });
    }, 400);
  };

  const disclaimer = "This information is for educational purposes only and does not constitute SEBI-registered financial, investment, legal, or tax advice.";

  // Dynamic Chart Allocation formatting
  const allocationPieData = useMemo(() => {
    return Object.keys(metrics.categoryTotals).map(cat => ({
      name: cat,
      value: metrics.categoryTotals[cat]
    }));
  }, [metrics.categoryTotals]);

  const sectorBarData = useMemo(() => {
    return Object.keys(metrics.sectorTotals).map(sec => ({
      name: sec,
      allocation: metrics.sectorTotals[sec]
    }));
  }, [metrics.sectorTotals]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} className="animate-fade-in">
      
      {/* Portfolio Title Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ color: 'var(--text-main)', fontSize: '1.65rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Wallet size={24} color="var(--primary)" className="float-3d" />
            Prefin Portfolio Intelligence Console
          </h2>
          <p style={{ color: 'var(--text-light)', fontSize: '0.85rem', margin: '0.25rem 0 0 0', fontWeight: 600 }}>
            Analyze allocation risks, track compounding goals, and consult the AI Wealth Coach.
          </p>
        </div>

        {/* PDF Export trigger */}
        <button
          onClick={handleExportPDF}
          style={{
            background: 'var(--text-main)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '0.65rem 1.25rem',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <Download size={14} />
          Export Wealth Report
        </button>
      </div>

      {/* Sub Tabs Navigation */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        gap: '1.5rem',
        paddingBottom: '2px',
        overflowX: 'auto'
      }}>
        {[
          { id: 'ledger', label: 'Holdings Ledger & Imports', icon: <Wallet size={16} /> },
          { id: 'diagnostics', label: 'AI Risk Diagnostics', icon: <Activity size={16} /> },
          { id: 'goals', label: 'Goal-Based Investing', icon: <Target size={16} /> },
          { id: 'coach', label: 'AI Portfolio Coach', icon: <FileText size={16} /> }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveSubTab(t.id)}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: activeSubTab === t.id ? '2.5px solid var(--primary)' : '2.5px solid transparent',
              color: activeSubTab === t.id ? 'var(--primary)' : 'var(--text-light)',
              fontWeight: 800,
              fontSize: '0.85rem',
              padding: '0.5rem 0.25rem 0.75rem 0.25rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.15s'
            }}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* -------------------- 1. LEDGER & STATEMENT IMPORTS TAB -------------------- */}
      {activeSubTab === 'ledger' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Summary Wealth Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem' }}>
            <div className="wealth-card" style={{ padding: '1.5rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>Invested Principal</span>
              <h3 style={{ fontSize: '1.6rem', color: 'var(--text-main)', marginTop: '0.4rem', fontFamily: 'monospace', fontWeight: 800 }}>
                ₹{metrics.totalInvested.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="wealth-card" style={{ padding: '1.5rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>Current Valuation</span>
              <h3 style={{ fontSize: '1.6rem', color: 'var(--text-main)', marginTop: '0.4rem', fontFamily: 'monospace', fontWeight: 800 }}>
                ₹{metrics.totalCurrent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="wealth-card" style={{ padding: '1.5rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>Net Unrealized Yield</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                <h3 style={{ 
                  fontSize: '1.6rem', 
                  color: metrics.absolutePl >= 0 ? 'var(--success)' : 'var(--danger)',
                  margin: 0,
                  fontFamily: 'monospace',
                  fontWeight: 800
                }}>
                  ₹{metrics.absolutePl.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
                <span className={metrics.absolutePl >= 0 ? 'badge-growth' : 'badge-drop'} style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', fontWeight: 800 }}>
                  {metrics.absolutePl >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {metrics.plPercentage.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* Statement Parser Zones & Adding Forms */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }} className="dashboard-grid">
            
            {/* Statement Drag Zone */}
            <div className="wealth-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              
              {isUploading && (
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  background: 'rgba(255,255,255,0.92)',
                  zIndex: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '1rem',
                  padding: '1.5rem'
                }}>
                  <div style={{ width: '80%', height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s ease' }} />
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>{uploadProgress}% Complete</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', textAlign: 'center', fontWeight: 600 }}>{uploadStatus}</span>
                </div>
              )}

              <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Upload size={18} color="var(--primary)" />
                AI Consolidated Broker Statement Import
              </h3>
              
              <div 
                onClick={() => document.getElementById('broker-statement-upload').click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    handleStatementUpload(e);
                  }
                }}
                style={{
                  border: '2px dashed rgba(37,99,235,0.18)',
                  background: 'rgba(37,99,235,0.02)',
                  borderRadius: '16px',
                  padding: '2.5rem 1.5rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(37,99,235,0.04)';
                  e.currentTarget.style.borderColor = 'var(--primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(37,99,235,0.02)';
                  e.currentTarget.style.borderColor = 'rgba(37,99,235,0.18)';
                }}
              >
                <input 
                  type="file" 
                  id="broker-statement-upload" 
                  accept=".pdf,.xlsx,.xls,.csv" 
                  style={{ display: 'none' }} 
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleStatementUpload(e);
                    }
                  }} 
                />
                <Upload size={32} color="var(--primary)" style={{ margin: '0 auto 0.75rem auto' }} className="float-3d" />
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.25rem 0' }}>
                  Drag & Drop Broker Statements
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', margin: '0 0 1rem 0', fontWeight: 600 }}>
                  Supports Zerodha console (PDF), Groww holdings (Excel), Angel One (PDF), and standard CAS files.
                </p>
                <span style={{
                  display: 'inline-block',
                  background: 'var(--primary)',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.45rem 1rem',
                  borderRadius: '8px',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  Select statement file
                </span>
              </div>
            </div>

            {/* Manual Form */}
            <div className="wealth-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Plus size={18} color="var(--primary)" />
                Record Manual Transaction Entry
              </h3>
              <form onSubmit={handleAddHolding} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', position: 'relative' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-light)' }}>Asset Name</label>
                    <div className="input-field-wrapper" style={{ padding: '0 0.5rem' }}>
                      <input type="text" className="input-field" placeholder="e.g. Infosys Ltd" value={newName} onChange={handleNameChange} required style={{ fontSize: '0.8rem', width: '100%' }} />
                    </div>
                    {nameSuggestions.length > 0 && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', zIndex: 10, maxHeight: '150px', overflowY: 'auto', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                        {nameSuggestions.map(s => (
                          <div 
                            key={s.symbol} 
                            onClick={() => handleSelectSuggestion(s)} 
                            style={{ padding: '0.5rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem', borderBottom: '1px solid #f1f5f9' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <strong>{s.name}</strong> <span style={{ color: 'var(--text-light)', fontSize: '0.7rem' }}>({s.symbol})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', position: 'relative' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-light)' }}>Ticker (NSE)</label>
                    <div className="input-field-wrapper" style={{ padding: '0 0.5rem' }}>
                      <input type="text" className="input-field" placeholder="e.g. INFY" value={newSymbol} onChange={handleSymbolChange} style={{ fontSize: '0.8rem', width: '100%' }} />
                    </div>
                    {symbolSuggestions.length > 0 && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', zIndex: 10, maxHeight: '150px', overflowY: 'auto', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                        {symbolSuggestions.map(s => (
                          <div 
                            key={s.symbol} 
                            onClick={() => handleSelectSuggestion(s)} 
                            style={{ padding: '0.5rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem', borderBottom: '1px solid #f1f5f9' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <strong>{s.symbol}</strong> <span style={{ color: 'var(--text-light)', fontSize: '0.7rem' }}>- {s.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-light)' }}>Category</label>
                    <select
                      style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', padding: '0.5rem 0.75rem', color: 'var(--text-main)', fontSize: '0.8rem', fontWeight: 600, outline: 'none' }}
                      value={newCategory} onChange={(e) => { setNewCategory(e.target.value); setNewName(''); setNewSymbol(''); setNameSuggestions([]); setSymbolSuggestions([]); }}
                    >
                      <option value="Equity">Equity Shares</option>
                      <option value="Mutual Funds">Mutual Funds</option>
                      <option value="Commodities">Commodities</option>
                      <option value="Cryptocurrency">Cryptocurrency</option>
                      <option value="Fixed Deposit">Fixed Deposit</option>
                      <option value="NPS">National Pension System</option>
                      <option value="PPF">Public Provident Fund</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-light)' }}>Sector</label>
                    <select
                      style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', padding: '0.5rem 0.75rem', color: 'var(--text-main)', fontSize: '0.8rem', fontWeight: 600, outline: 'none' }}
                      value={newSector} onChange={(e) => setNewSector(e.target.value)}
                    >
                      <option value="Banking">Banking/Finance</option>
                      <option value="IT Services">Information Tech</option>
                      <option value="Gold">Gold/Precious</option>
                      <option value="Crypto">Crypto Tokens</option>
                      <option value="Conglomerate">Conglomerate</option>
                      <option value="Metals">Metal Producers</option>
                      <option value="Retail">Consumer Retail</option>
                      <option value="Government">Government Debt</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {lots.map((lot, index) => (
                    <div key={lot.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.75rem', alignItems: 'end' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {index === 0 && <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-light)' }}>Date of Purchase</label>}
                        <div className="input-field-wrapper" style={{ padding: '0 0.5rem' }}>
                          <input type="date" className="input-field" value={lot.date} onChange={(e) => handleLotChange(lot.id, 'date', e.target.value)} style={{ fontSize: '0.8rem' }} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {index === 0 && <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-light)' }}>Quantity</label>}
                        <div className="input-field-wrapper" style={{ padding: '0 0.5rem' }}>
                          <input type="number" className="input-field" placeholder="10" value={lot.quantity} onChange={(e) => handleLotChange(lot.id, 'quantity', e.target.value)} required min="0" step="any" style={{ fontSize: '0.8rem' }} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {index === 0 && <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-light)' }}>Lowest Buy Price (₹)</label>}
                        <div className="input-field-wrapper" style={{ padding: '0 0.5rem' }}>
                          <input type="number" className="input-field" placeholder="1500" value={lot.price} onChange={(e) => handleLotChange(lot.id, 'price', e.target.value)} required min="0" step="any" style={{ fontSize: '0.8rem' }} />
                        </div>
                      </div>
                      {lots.length > 1 && (
                        <button type="button" onClick={() => removeLot(lot.id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.6rem' }} title="Remove lot">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                    <button type="button" onClick={addLot} style={{ background: 'transparent', border: '1px dashed var(--primary)', color: 'var(--primary)', cursor: 'pointer', padding: '0.4rem 0.8rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 700 }} title="Add another price/lot">
                      <Plus size={14} /> Add Purchase Lot
                    </button>
                  </div>
                </div>

                {lots.length > 1 && (
                  <div style={{ background: 'rgba(37,99,235,0.04)', border: '1px dashed rgba(37,99,235,0.15)', padding: '0.75rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>Aggregated Summary</span>
                    <div style={{ display: 'flex', gap: '1.5rem', textAlign: 'right' }}>
                       <div>
                         <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-light)', fontWeight: 700 }}>TOTAL QTY</span>
                         <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'monospace' }}>
                           {lots.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0)}
                         </span>
                       </div>
                       <div>
                         <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-light)', fontWeight: 700 }}>AVERAGE PRICE</span>
                         <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace' }}>
                           ₹{(() => {
                             let tQty = 0; let tVal = 0;
                             lots.forEach(l => { 
                               tQty += Number(l.quantity) || 0; 
                               tVal += (Number(l.quantity) || 0) * (Number(l.price) || 0); 
                             });
                             return tQty > 0 ? (tVal / tQty).toFixed(2) : '0.00';
                           })()}
                         </span>
                       </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  style={{
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '0.6rem',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    boxShadow: 'var(--shadow-sm)',
                    marginTop: '0.25rem'
                  }}
                >
                  <Plus size={16} />
                  Record Asset holding
                </button>
              </form>
            </div>
          </div>

          {/* Holdings Table */}
          <div className="wealth-card" style={{ padding: '1.75rem', overflowX: 'auto' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '0.75rem' }}>
              Active Holdings & Live Market Valuations
            </h3>
            {/* Category Filter Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              {['All', 'Equity', 'Mutual Funds', 'Commodities', 'Cryptocurrency', 'Fixed Deposit', 'NPS', 'PPF'].map(cat => {
                const count = cat === 'All' ? processedHoldings.length : processedHoldings.filter(h => h.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setHoldingsFilter(cat)}
                    style={{
                      background: holdingsFilter === cat ? 'var(--primary)' : 'rgba(37,99,235,0.06)',
                      color: holdingsFilter === cat ? '#fff' : 'var(--text-light)',
                      border: 'none',
                      borderRadius: '20px',
                      padding: '0.35rem 0.85rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    {cat}
                    <span style={{
                      background: holdingsFilter === cat ? 'rgba(255,255,255,0.25)' : 'rgba(37,99,235,0.1)',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '10px',
                      fontSize: '0.68rem',
                      fontWeight: 800
                    }}>{count}</span>
                  </button>
                );
              })}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(0,0,0,0.03)', textAlign: 'left', color: 'var(--text-light)' }}>
                  <th style={{ padding: '0.5rem 0.25rem' }}>Asset & Symbol</th>
                  <th style={{ padding: '0.5rem 0.25rem' }}>Category</th>
                  <th style={{ padding: '0.5rem 0.25rem', textAlign: 'right' }}>Qty</th>
                  <th style={{ padding: '0.5rem 0.25rem', textAlign: 'right' }}>Avg Buy Price</th>
                  <th style={{ padding: '0.5rem 0.25rem', textAlign: 'right' }}>Total Invested</th>
                  <th style={{ padding: '0.5rem 0.25rem', textAlign: 'right' }}>Live Price</th>
                  <th style={{ padding: '0.5rem 0.25rem', textAlign: 'right' }}>Current Value</th>
                  <th style={{ padding: '0.5rem 0.25rem', textAlign: 'right' }}>Net Return P/L</th>
                  <th style={{ padding: '0.5rem 0.25rem', textAlign: 'center' }}>AI Directives</th>
                  <th style={{ padding: '0.5rem 0.25rem', textAlign: 'center' }}>Purge</th>
                </tr>
              </thead>
              <tbody>
                {processedHoldings.filter(h => holdingsFilter === 'All' || h.category === holdingsFilter).map(h => {
                  const isPositive = h.pl >= 0;
                  return (
                    <React.Fragment key={h.id}>
                      <tr 
                        onClick={() => setExpandedHoldingId(expandedHoldingId === h.id ? null : h.id)}
                        style={{ borderBottom: '1px solid rgba(0,0,0,0.02)', verticalAlign: 'middle', cursor: 'pointer' }}
                        className="hover-bg-light"
                      >
                        <td style={{ padding: '0.75rem 0.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {expandedHoldingId === h.id ? <ChevronUp size={16} color="var(--primary)" /> : <ChevronDown size={16} color="var(--text-light)" />}
                            <div>
                              <span style={{ fontWeight: 800, display: 'block', color: 'var(--text-main)' }}>{h.name}</span>
                              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>{h.symbol} • {h.sector}</span>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem 0.25rem', color: 'var(--text-light)', fontWeight: 700 }}>{h.category}</td>
                        <td style={{ padding: '0.75rem 0.25rem', textAlign: 'right', fontWeight: 600 }}>{h.quantity}</td>
                        <td style={{ padding: '0.75rem 0.25rem', textAlign: 'right', fontWeight: 600, fontFamily: 'monospace' }}>
                          ₹{h.buyPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '0.75rem 0.25rem', textAlign: 'right', fontWeight: 600, fontFamily: 'monospace' }}>
                          ₹{(h.quantity * h.buyPrice).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '0.75rem 0.25rem', textAlign: 'right', fontWeight: 700, fontFamily: 'monospace', color: 'var(--primary)' }}>
                          ₹{h.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                        </td>
                        <td style={{ padding: '0.75rem 0.25rem', textAlign: 'right', fontWeight: 700, fontFamily: 'monospace' }}>
                          ₹{h.current.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td style={{ 
                          padding: '0.75rem 0.25rem', 
                          textAlign: 'right', 
                          fontWeight: 800, 
                          color: isPositive ? 'var(--success)' : 'var(--danger)',
                          fontFamily: 'monospace'
                        }}>
                          <div>{isPositive ? '+' : ''}{h.pl.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                          <div style={{ fontSize: '0.68rem', fontWeight: 800 }}>({isPositive ? '+' : ''}{h.plPct.toFixed(2)}%)</div>
                        </td>
                        <td style={{ padding: '0.75rem 0.25rem', textAlign: 'center' }}>
                          <span style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            background: h.recommendation === 'BUY MORE' ? 'var(--success-glow)' : h.recommendation === 'HOLD' ? 'var(--primary-glow)' : 'var(--danger-glow)',
                            color: h.recommendation === 'BUY MORE' ? 'var(--success)' : h.recommendation === 'HOLD' ? 'var(--primary)' : 'var(--danger)'
                          }} title={h.reason}>
                            {h.recommendation}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 0.25rem', textAlign: 'center' }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteHolding(h.id); }}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-light)', cursor: 'pointer', padding: '0.25rem', borderRadius: '4px' }}
                            className="hover-danger"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                      {/* Expanded AI Reasoning panel */}
                      <tr style={{ background: 'rgba(37,99,235,0.015)' }}>
                        <td colSpan={10} style={{ padding: '0.5rem 0.75rem', fontSize: '0.72rem', color: 'var(--text-muted)', borderBottom: '1px solid rgba(0,0,0,0.03)', fontWeight: 600 }}>
                          <strong style={{ color: 'var(--primary)' }}>AI Rationale:</strong> {h.reason}
                        </td>
                      </tr>
                      {/* Expanded Lot History */}
                      {expandedHoldingId === h.id && (
                        <tr style={{ background: 'rgba(0,0,0,0.01)' }}>
                          <td colSpan={10} style={{ padding: '1rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                            <div style={{ background: '#fff', borderRadius: '8px', padding: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)' }}>
                              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: 'var(--text-main)' }}>Purchase History ({h.symbol})</h4>
                              <table style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse' }}>
                                <thead>
                                  <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', textAlign: 'left', color: 'var(--text-light)' }}>
                                    <th style={{ padding: '0.4rem' }}>Purchase Date</th>
                                    <th style={{ padding: '0.4rem', textAlign: 'right' }}>Buy Price</th>
                                    <th style={{ padding: '0.4rem', textAlign: 'right' }}>Quantity</th>
                                    <th style={{ padding: '0.4rem', textAlign: 'right' }}>Total Invested</th>
                                    <th style={{ padding: '0.4rem', textAlign: 'center' }}>Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {purchaseLotsHistory.filter(lot => lot.holdingSymbol === h.symbol).map(lot => (
                                    <tr key={lot.lotId} style={{ borderBottom: '1px solid rgba(0,0,0,0.02)' }}>
                                      <td style={{ padding: '0.5rem 0.4rem', fontWeight: 600 }}>{lot.purchaseDate}</td>
                                      <td style={{ padding: '0.5rem 0.4rem', textAlign: 'right', fontFamily: 'monospace' }}>₹{lot.buyPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                      <td style={{ padding: '0.5rem 0.4rem', textAlign: 'right', fontFamily: 'monospace' }}>
                                        {editingLotId === lot.lotId ? (
                                          <input type="number" min="0" step="any" value={editLotQty} onChange={e => setEditLotQty(e.target.value)} onClick={(e) => e.stopPropagation()} style={{ width: '60px', padding: '0.2rem', textAlign: 'right', borderRadius: '4px', border: '1px solid var(--primary)', outline: 'none' }} />
                                        ) : (
                                          lot.quantity
                                        )}
                                      </td>
                                      <td style={{ padding: '0.5rem 0.4rem', textAlign: 'right', fontFamily: 'monospace' }}>₹{(lot.quantity * lot.buyPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                      <td style={{ padding: '0.5rem 0.4rem', textAlign: 'center' }}>
                                        {editingLotId === lot.lotId ? (
                                          <button onClick={(e) => { e.stopPropagation(); handleUpdateLotQuantity(lot.lotId, h.symbol); }} style={{ background: 'var(--primary-glow)', color: 'var(--primary)', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.7rem', fontWeight: 700 }} title="Save">
                                            <Save size={12} /> Save
                                          </button>
                                        ) : (
                                          <button onClick={(e) => { e.stopPropagation(); setEditingLotId(lot.lotId); setEditLotQty(lot.quantity); }} style={{ background: 'transparent', color: 'var(--text-light)', border: 'none', cursor: 'pointer' }} title="Edit / Sell Units" className="hover-primary">
                                            <Edit2 size={14} />
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                  {purchaseLotsHistory.filter(lot => lot.holdingSymbol === h.symbol).length === 0 && (
                                    <tr><td colSpan={5} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>No detailed purchase history available for this asset.</td></tr>
                                  )}
                                </tbody>
                              </table>

                              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: 'var(--text-main)' }}>Record a Sale (FIFO Match)</h4>
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'end', marginBottom: '1.5rem' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                                    <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-light)' }}>Sell Date</label>
                                    <input type="date" value={sellDate} onChange={e => {
                                      setSellDate(e.target.value);
                                      if (e.target.value) {
                                        setSellPrice(generateMockHistoricalPrice(h.symbol, e.target.value));
                                      }
                                    }} onClick={e => e.stopPropagation()} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-light)' }} />
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                                    <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-light)' }}>Quantity</label>
                                    <input type="number" min="0" step="any" placeholder="Units to sell" value={sellQuantity} onChange={e => setSellQuantity(e.target.value)} onClick={e => e.stopPropagation()} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-light)' }} />
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                                    <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-light)' }}>Sell Price (₹)</label>
                                    <input type="number" min="0" step="any" placeholder="Price per unit" value={sellPrice} onChange={e => setSellPrice(e.target.value)} onClick={e => e.stopPropagation()} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-light)' }} />
                                  </div>
                                  <button onClick={(e) => { e.stopPropagation(); handleRecordSale(h.symbol); }} style={{ background: 'var(--danger)', color: '#fff', border: 'none', padding: '0.55rem 1rem', borderRadius: '6px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }} className="hover-lift">
                                    <Trash2 size={14} /> Sell Units
                                  </button>
                                </div>
                                
                                {salesHistory.filter(s => s.symbol === h.symbol).length > 0 && (
                                  <>
                                    <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: 'var(--text-main)' }}>Sales History & Realized P/L</h4>
                                    <table style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse' }}>
                                      <thead>
                                        <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', textAlign: 'left', color: 'var(--text-light)' }}>
                                          <th style={{ padding: '0.4rem' }}>Sell Date</th>
                                          <th style={{ padding: '0.4rem', textAlign: 'right' }}>Sell Price</th>
                                          <th style={{ padding: '0.4rem', textAlign: 'right' }}>Qty Sold</th>
                                          <th style={{ padding: '0.4rem', textAlign: 'right' }}>Realized P/L</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {salesHistory.filter(s => s.symbol === h.symbol).map(sale => {
                                          const isProfit = sale.realizedPL >= 0;
                                          return (
                                            <tr key={sale.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.02)' }}>
                                              <td style={{ padding: '0.5rem 0.4rem', fontWeight: 600 }}>{sale.sellDate}</td>
                                              <td style={{ padding: '0.5rem 0.4rem', textAlign: 'right', fontFamily: 'monospace' }}>₹{sale.sellPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                              <td style={{ padding: '0.5rem 0.4rem', textAlign: 'right', fontFamily: 'monospace' }}>{sale.quantity}</td>
                                              <td style={{ padding: '0.5rem 0.4rem', textAlign: 'right', fontWeight: 800, fontFamily: 'monospace', color: isProfit ? 'var(--success)' : 'var(--danger)' }}>
                                                {isProfit ? '+' : ''}₹{sale.realizedPL.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------- 2. AI DIAGNOSTICS TAB -------------------- */}
      {activeSubTab === 'diagnostics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Top Row: Circular Health Score & Highlights */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }} className="dashboard-grid">
            
            {/* Health Meter Card */}
            <div className="wealth-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', margin: '0 0 1.5rem 0', fontWeight: 800 }}>
                Portfolio Health Score Index
              </h3>
              
              {/* Radial Score Gauge */}
              <div style={{ position: 'relative', width: '130px', height: '130px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
                <svg width="100%" height="100%" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="3.5"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={healthGrade.color}
                    strokeDasharray={`${healthScore}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
                <div style={{
                  position: 'absolute',
                  top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center'
                }}>
                  <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)', fontFamily: 'monospace' }}>
                    {healthScore}
                  </span>
                  <span style={{ fontSize: '0.72rem', display: 'block', color: 'var(--text-light)', fontWeight: 700 }}>/ 100</span>
                </div>
              </div>

              <span style={{
                fontSize: '0.85rem',
                fontWeight: 900,
                color: healthGrade.color,
                background: `${healthGrade.color}08`,
                padding: '0.3rem 0.75rem',
                borderRadius: '6px',
                marginBottom: '0.5rem'
              }}>
                {healthGrade.rating}
              </span>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4, margin: 0, fontWeight: 500, maxWidth: '280px' }}>
                {healthGrade.msg}
              </p>
            </div>

            {/* AI Diagnostics Risk Sheet */}
            <div className="wealth-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', margin: 0 }}>
                Diagnostic Risk Scorecard
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>Volatility Score</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>MEDIUM</span>
                    <span style={{ fontSize: '0.7rem', background: 'rgba(37,99,235,0.06)', color: 'var(--primary)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>Beta: 1.08</span>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>Drawdown Risk</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--danger)' }}>14.2% Est.</span>
                    <span style={{ fontSize: '0.7rem', background: 'var(--danger-glow)', color: 'var(--danger)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>95% VaR</span>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>Liquidity Ratio</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--success)' }}>HIGH (82%)</span>
                    <span style={{ fontSize: '0.7rem', background: 'var(--success-glow)', color: 'var(--success)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>Intraday</span>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>Diversification Index</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>{Object.keys(metrics.categoryTotals).length} Sectors</span>
                    <span style={{ fontSize: '0.7rem', background: 'rgba(0,0,0,0.04)', color: 'var(--text-light)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>Optimal</span>
                  </div>
                </div>
              </div>

              {/* Performers highlights */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>🏆 HIGHEST PROFIT HOLDING:</span>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.1rem' }}>
                    {metrics.highestGainer ? `${metrics.highestGainer.name} (+${metrics.highestGainer.plPct.toFixed(1)}%)` : 'N/A'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>⚠️ HIGHEST LOSS HOLDING:</span>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--danger)', marginTop: '0.1rem' }}>
                    {metrics.highestLoser ? `${metrics.highestLoser.name} (${metrics.highestLoser.plPct.toFixed(1)}%)` : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Allocation Charts: Pie & Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="dashboard-grid">
            
            {/* Pie Category allocation */}
            <div className="wealth-card" style={{ padding: '1.75rem', minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '1.25rem' }}>Asset Class Distribution</h3>
              {processedHoldings.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)', fontSize: '0.85rem' }}>
                  No active records logged.
                </div>
              ) : (
                <div style={{ flex: 1, width: '100%', height: '100%', minHeight: '200px' }}>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={allocationPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {allocationPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', fontWeight: 700 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Bar Sector allocation */}
            <div className="wealth-card" style={{ padding: '1.75rem', minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '1.25rem' }}>Sector Allocation Exposure</h3>
              {processedHoldings.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)', fontSize: '0.85rem' }}>
                  No active records logged.
                </div>
              ) : (
                <div style={{ flex: 1, width: '100%', height: '100%', minHeight: '200px' }}>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={sectorBarData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 9, fontWeight: 700 }} tickLine={false} />
                      <YAxis stroke="var(--text-muted)" tick={{ fontSize: 9, fontWeight: 700 }} tickLine={false} axisLine={false} width={40} tickFormatter={(v) => `₹${v/1000}k`} />
                      <Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`} />
                      <Bar dataKey="allocation" fill="var(--primary)" radius={[8, 8, 0, 0]}>
                        {sectorBarData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.85} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Combined Market + Portfolio Advisor Action Plan */}
          <div className="wealth-card" style={{ padding: '1.75rem', background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(245,250,255,0.75) 100%)' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={18} color="var(--primary)" className="float-3d" />
              Dynamic AI Advisor Action Plan
            </h3>
            
            <p style={{ fontSize: '0.82rem', lineHeight: 1.5, color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>
              Based on today's active Nifty valuations and your sector concentrations, we suggest the following allocations:
              <br /><br />
              - **Examine Banking Exposure**: Banking equities comprise **{((metrics.sectorTotals['Banking'] || 0) / (metrics.totalCurrent || 1) * 100).toFixed(1)}%** of your wealth. While outlook is positive, lock in partial profits from high beta stocks if Nifty tests resistance.
              <br />
              - **Diversify speculatives**: Your Cryptocurrency holdings represent **{((metrics.categoryTotals['Cryptocurrency'] || 0) / (metrics.totalCurrent || 1) * 100).toFixed(1)}%** of total net worth. Secure capital by rebalancing 10% of crypto yields into low-risk government debt funds.
              <br />
              - **Enhance Gold Buffers**: Keep commodities hedges above 15% to absorb macro interest rate shifts.
            </p>
          </div>
        </div>
      )}

      {/* -------------------- 3. GOAL-BASED INVESTING TAB -------------------- */}
      {activeSubTab === 'goals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Add Goal & Tracker Columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }} className="dashboard-grid">
            
            {/* Create Goal Form */}
            <div className="wealth-card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Target size={18} color="var(--primary)" />
                Configure New Wealth Goal
              </h3>
              
              <form onSubmit={handleAddGoal} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-light)' }}>Goal Description</label>
                  <div className="input-field-wrapper" style={{ padding: '0 0.5rem' }}>
                    <input type="text" className="input-field" placeholder="e.g. Retirement portfolio" value={goalName} onChange={(e) => setGoalName(e.target.value)} required style={{ fontSize: '0.8rem' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-light)' }}>Target Capital (₹)</label>
                    <div className="input-field-wrapper" style={{ padding: '0 0.5rem' }}>
                      <input type="number" className="input-field" placeholder="5000000" value={goalTarget} onChange={(e) => setGoalTarget(e.target.value)} required min="1000" style={{ fontSize: '0.8rem' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-light)' }}>Target Year</label>
                    <div className="input-field-wrapper" style={{ padding: '0 0.5rem' }}>
                      <input type="number" className="input-field" placeholder="2035" value={goalYear} onChange={(e) => setGoalYear(e.target.value)} required min={new Date().getFullYear()} style={{ fontSize: '0.8rem' }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-light)' }}>Linked Asset Category</label>
                  <select
                    style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', padding: '0.5rem 0.75rem', color: 'var(--text-main)', fontSize: '0.8rem', fontWeight: 600, outline: 'none' }}
                    value={goalCategory} onChange={(e) => setGoalCategory(e.target.value)}
                  >
                    <option value="Equity">Equity shares (High Growth)</option>
                    <option value="Mutual Funds">Mutual Funds (Balanced)</option>
                    <option value="Commodities">Commodities / Gold (Inflation Hedge)</option>
                    <option value="Fixed Deposit">Fixed Deposits (Capital Security)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  style={{
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '0.65rem',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    boxShadow: 'var(--shadow-sm)',
                    marginTop: '0.5rem'
                  }}
                >
                  <Plus size={16} />
                  Initiate target Goal
                </button>
              </form>
            </div>

            {/* Goals List Tracker */}
            <div className="wealth-card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '1.25rem' }}>
                Active Target Progress Sheets
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {goals.map(g => {
                  // Link progress dynamically based on the category total holdings current valuation
                  const matchingCategoryTotal = metrics.categoryTotals[g.category] || 0;
                  const currentSaved = Math.min(g.targetAmount, matchingCategoryTotal);
                  const progressPct = g.targetAmount > 0 ? (currentSaved / g.targetAmount) * 100 : 0;
                  
                  const isBehind = progressPct < 15; // mock warning
                  
                  return (
                    <div 
                      key={g.id}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid var(--border-light)',
                        borderRadius: '14px',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h4 style={{ color: 'var(--text-main)', fontSize: '0.92rem', margin: 0, fontWeight: 800 }}>{g.name}</h4>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-light)', fontWeight: 700 }}>
                            Linked category: {g.category} (Current Val: ₹{matchingCategoryTotal.toLocaleString('en-IN')})
                          </span>
                        </div>
                        
                        <button
                          onClick={() => handleDeleteGoal(g.id)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-light)', cursor: 'pointer', padding: '0.1rem' }}
                          className="hover-danger"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      {/* Progress bar */}
                      <div style={{ marginTop: '0.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                          <span style={{ color: 'var(--text-main)', fontFamily: 'monospace' }}>
                            ₹{currentSaved.toLocaleString('en-IN')} / ₹{g.targetAmount.toLocaleString('en-IN')}
                          </span>
                          <span style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{progressPct.toFixed(1)}%</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${progressPct}%`, height: '100%', background: isBehind ? '#e11d48' : 'var(--primary)', borderRadius: '4px' }} />
                        </div>
                      </div>

                      {/* AI suggestions */}
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: '#ffffff', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.02)', marginTop: '0.25rem', fontWeight: 600 }}>
                        <strong style={{ color: 'var(--primary)' }}>Coach Advisory:</strong>{' '}
                        {progressPct >= 100 
                          ? 'Goal completed! Reallocate proceeds into stable fixed income or define a new target.'
                          : isBehind 
                            ? `Increase your linked ${g.category} contributions by ₹4,500 monthly to stay on schedule for target year ${g.targetYear}.`
                            : `On track! Compounding at 12% CAGR will successfully meet the target by year ${g.targetYear}.`}
                      </div>
                    </div>
                  );
                })}

                {goals.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    No financial goals logged. Setup a target on the left.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- 4. AI DAILY PORTFOLIO COACH TAB -------------------- */}
      {activeSubTab === 'coach' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Brief select panels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            {[
              { id: 'morning', label: 'Morning Briefing', desc: 'Market cues & pre-open triggers.' },
              { id: 'evening', label: 'Evening Summary', desc: 'Index close & P/L return calculations.' },
              { id: 'weekly', label: 'Weekly Advisory Review', desc: 'Macro allocations & rebalancing plans.' },
              { id: 'monthly', label: 'Monthly Wealth Report', desc: 'Compound metrics & target evaluations.' }
            ].map(r => (
              <button
                key={r.id}
                onClick={() => handleGenerateCoachReport(r.id)}
                disabled={isGeneratingReport}
                style={{
                  background: selectedReport === r.id ? 'var(--primary)' : 'rgba(255,255,255,0.7)',
                  color: selectedReport === r.id ? '#ffffff' : 'var(--text-main)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.2s',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <FileText size={18} color={selectedReport === r.id ? '#ffffff' : 'var(--primary)'} />
                  <Sparkles size={12} color={selectedReport === r.id ? '#ffffff' : 'rgba(37,99,235,0.3)'} className="float-3d" />
                </div>
                <h4 style={{ fontSize: '0.9rem', margin: '0 0 0.25rem 0', fontWeight: 800 }}>{r.label}</h4>
                <p style={{ fontSize: '0.72rem', color: selectedReport === r.id ? 'rgba(255,255,255,0.8)' : 'var(--text-light)', margin: 0, fontWeight: 500, lineHeight: 1.3 }}>
                  {r.desc}
                </p>
              </button>
            ))}
          </div>

          {/* Rerender report content area */}
          {selectedReport && (
            <div className="wealth-card" style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }} className="animate-fade-in">
              
              {isGeneratingReport && (
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  background: 'rgba(255, 255, 255, 0.9)',
                  zIndex: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '1rem'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    border: '3px solid rgba(37, 99, 235, 0.1)',
                    borderTopColor: 'var(--primary)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Coach Alpha is auditing database and compiling macro updates...
                  </span>
                </div>
              )}

              {/* Display parsed report with markdown simulation styling */}
              {reportContent && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  {/* Custom render helper */}
                  <div style={{ fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--text-muted)' }}>
                    {reportContent.split('\n\n').map((block, bIdx) => {
                      if (block.startsWith('### ')) {
                        return (
                          <h4 key={bIdx} style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)', margin: '1rem 0 0.5rem 0', borderBottom: '1px solid rgba(37,99,235,0.06)', paddingBottom: '3px' }}>
                            {block.substring(4)}
                          </h4>
                        );
                      }
                      return (
                        <p key={bIdx} style={{ margin: '0.5rem 0', fontWeight: 500 }}>
                          {block.split('\n').map((line, lIdx) => {
                            if (line.startsWith('- ')) {
                              return (
                                <span key={lIdx} style={{ display: 'block', paddingLeft: '1rem', position: 'relative' }}>
                                  <span style={{ color: 'var(--primary)', position: 'absolute', left: 0 }}>•</span>
                                  {line.substring(2)}
                                </span>
                              );
                            }
                            return <span key={lIdx}>{line}<br /></span>;
                          })}
                        </p>
                      );
                    })}
                  </div>

                  {/* SEBI Disclaimer */}
                  <div style={{
                    display: 'flex',
                    gap: '6px',
                    alignItems: 'flex-start',
                    background: 'rgba(239, 68, 68, 0.04)',
                    border: '1px dashed rgba(239, 68, 68, 0.15)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.72rem',
                    color: 'var(--text-light)',
                    marginTop: '1rem',
                    lineHeight: 1.4
                  }}>
                    <ShieldAlert size={12} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--danger)' }} />
                    <div>
                      <strong style={{ color: 'var(--danger)', fontWeight: 800 }}>SEBI Disclaimer: </strong>
                      {disclaimer}
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

          {!selectedReport && (
            <div className="wealth-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-light)' }}>
              <FileText size={42} color="var(--primary)" style={{ margin: '0 auto 1rem auto' }} className="float-3d" />
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.25rem 0' }}>
                Wealth Coach Hub
              </h4>
              <p style={{ fontSize: '0.8rem', margin: 0, fontWeight: 500 }}>
                Select a briefing tab above to generate a dynamic wealth audit report.
              </p>
            </div>
          )}

        </div>
      )}

      {/* -------------------- 5. PDF EXPORT COMPILING OVERLAY -------------------- */}
      {showExportModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(5px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            border: '1px solid var(--border-glass)',
            padding: '2rem 2.5rem',
            width: '100%',
            maxWidth: '380px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(37, 99, 235, 0.1)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1.25rem auto'
            }} />
            <h4 style={{ color: 'var(--text-main)', fontSize: '1rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
              Compiling PDF Report Ledger
            </h4>
            <div style={{ width: '100%', height: '5px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', margin: '1rem 0' }}>
              <div style={{ width: `${exportProgress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.2s' }} />
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 700 }}>
              Drawing charts and securing transaction hashes...
            </span>
          </div>
        </div>
      )}

      <style>{`
        .hover-danger:hover {
          color: var(--danger) !important;
          background: var(--danger-glow);
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  );
};

export default Portfolio;
