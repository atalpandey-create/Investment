import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Bot, User, Minimize2, MessageSquare, AlertTriangle } from 'lucide-react';

const presetPrompts = [
  "What should I invest ₹50,000 in for 10 years?",
  "Review my portfolio allocations",
  "Why is the stock market falling today?",
  "Compare HDFC Bank and ICICI Bank"
];

const getWealthAdvisorResponse = (text, context, marketData = {}, topGainers = []) => {
  const query = text.toLowerCase().trim();
  
  // 1. Context extraction
  let queryForAmount = query;

  // Extract duration first (e.g. 10 years, 5 saal)
  const yearMatch = query.match(/(\d+)\s*(?:year|yr|saal|sal|years)/i);
  if (yearMatch) {
    context.duration = parseInt(yearMatch[1], 10);
    // Remove duration from query to prevent it from matching as amount
    queryForAmount = queryForAmount.replace(yearMatch[0], '');
  }

  // Remove "under/below <number>" pattern to prevent matching it as amount
  const underMatch = queryForAmount.match(/(?:under|below|less than)\s*(?:rs\.?|inr|₹|rs)?\s*(\d+(?:,\d+)*(?:\.\d+)?)/i);
  if (underMatch) {
    queryForAmount = queryForAmount.replace(underMatch[0], '');
  }

  // Extract amount (e.g. ₹50,000, 50k, 1 lakh, etc.)
  const amountMatch = queryForAmount.match(/(?:rs\.?|inr|₹|rs)?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:thousand|lakh|cr|k|l)?/i);
  if (amountMatch) {
    let amt = parseFloat(amountMatch[1].replace(/,/g, ''));
    if (queryForAmount.includes('k') || queryForAmount.includes('thousand') || queryForAmount.includes('hazar')) {
      amt *= 1000;
    } else if (queryForAmount.includes('lakh') || queryForAmount.includes('lac') || queryForAmount.includes(' l ')) {
      amt *= 100000;
    } else if (queryForAmount.includes('cr') || queryForAmount.includes('crore')) {
      amt *= 10000000;
    }
    context.amount = amt;
  }
  
  // Extract risk profile
  if (query.includes('safe') || query.includes('low risk') || query.includes('no loss') || query.includes('surakshit') || query.includes('kam risk') || query.includes('conservative')) {
    context.risk = 'low';
  } else if (query.includes('high risk') || query.includes('multibagger') || query.includes('high return') || query.includes('aggressive') || query.includes('zyada risk') || query.includes('growth')) {
    context.risk = 'high';
  } else if (query.includes('moderate') || query.includes('medium risk') || query.includes('balanced') || query.includes('normal risk')) {
    context.risk = 'medium';
  }

  // Track stock/asset mentions
  if (query.includes('reliance') || query.includes('ril')) {
    context.lastStock = 'Reliance Industries';
  } else if (query.includes('hdfc')) {
    context.lastStock = 'HDFC Bank';
  } else if (query.includes('icici')) {
    context.lastStock = 'ICICI Bank';
  } else if (query.includes('trent')) {
    context.lastStock = 'Trent Ltd';
  } else if (query.includes('gold') || query.includes('sona')) {
    context.lastStock = 'Gold';
  } else if (query.includes('bond')) {
    context.lastStock = 'Bonds';
  }

  // Multi-language / Hinglish detection
  const hinges = ['kya', 'mujhe', 'karna', 'chahiye', 'kaise', 'batao', 'saal', 'liye', 'kahan', 'kaunsa', 'kamaye', 'hai', 'sona', 'paisey', 'sasta', 'kab', 'achha', 'behtar', 'nifty', 'gir', 'invest', 'stock', 'ko', 'me', 'par', 'aur', 'se', 'ya'];
  const words = query.split(/\s+/);
  const isHinglish = words.some(w => hinges.includes(w));

  const amount = context.amount;
  const duration = context.duration || 5;
  const risk = context.risk || 'medium';

  // Retrieve current live Nifty value or cache
  const niftyVal = marketData['NIFTY 50']?.price ? `₹${marketData['NIFTY 50'].price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '₹24,013.10';
  const niftyChangeVal = marketData['NIFTY 50']?.change != null ? marketData['NIFTY 50'].change : -0.64;
  const niftyChangeText = `${niftyChangeVal >= 0 ? '+' : ''}${niftyChangeVal.toFixed(2)}%`;
  const niftyArrow = niftyChangeVal >= 0 ? '▲' : '▼';

  // Gainers formatting
  const gainerSummary = topGainers && topGainers.length > 0
    ? topGainers.slice(0, 3).map(g => `${g.symbol} (▲ +${Number(g.change).toFixed(2)}%)`).join(', ')
    : 'TRENT (▲ +3.52%), BAJAJFINSV (▲ +2.91%), and SBIN (▲ +2.45%)';

  const disclaimer = "\n\nThis information is for educational purposes only and does not constitute SEBI-registered financial, investment, legal, or tax advice. Please perform independent diligence or consult a certified advisor before committing capital.";

  const buildOutput = (summary, analysis, advantages, risks, suggestedAction, hinglishIntro = '', followUps = []) => {
    let finalSummary = summary;
    if (isHinglish && hinglishIntro) {
      finalSummary = `**Wealth Coach Note (Hinglish):** ${hinglishIntro}\n\n${summary}`;
    }
    const responseText = `### Summary
${finalSummary}

### Analysis
${analysis}

### Advantages
${advantages}

### Risks
${risks}

### Suggested Action
${suggestedAction}${disclaimer}`;

    return { text: responseText, followUps };
  };

  // INTENT ROUTER

  // 1. Portfolio review & Diagnostics
  if (query.includes('portfolio') || query.includes('ledger') || query.includes('holding') || query.includes('allocation') || query.includes('diversif') || query.includes('diagnos')) {
    let holdings = [];
    try {
      const cached = localStorage.getItem(`Prefin_holdings_${user?.id || 'default'}`);
      holdings = cached ? JSON.parse(cached) : [];
    } catch (e) {
      holdings = [];
    }

    if (holdings.length === 0) {
      return buildOutput(
        "Your portfolio ledger is currently empty. No investments could be retrieved for diagnostic review.",
        "A proper portfolio analysis requires logging your active financial transactions. Please record items such as Equities, Mutual Funds, Commodities, and Fixed Income in the Ledger tab.",
        "Logging transactions allows you to track real-time yield adjustments, absolute return metrics, and dynamic asset class ratios.",
        "Without records, you cannot monitor potential concentration risks, asset overlaps, or crypto volatility exposure.",
        "Navigate to the Portfolio tab, enter your active investments, and return here for an instant risk critique.",
        "Aapka investment ledger abhi empty hai. Naya transactions load karne ke liye 'Portfolio' tab me entry karein, aur phir review command run karein.",
        ["Go to Portfolio tab"]
      );
    }

    let totalInvested = 0;
    let totalCurrent = 0;
    const catMap = {};
    holdings.forEach(h => {
      totalInvested += h.invested;
      totalCurrent += h.current;
      catMap[h.category] = (catMap[h.category] || 0) + h.current;
    });

    const netPl = totalCurrent - totalInvested;
    const plPct = totalInvested > 0 ? (netPl / totalInvested) * 100 : 0;

    const breakdownText = Object.keys(catMap).map(cat => {
      const pct = (catMap[cat] / totalCurrent) * 100;
      return `- **${cat}**: ₹${catMap[cat].toLocaleString('en-IN')} (${pct.toFixed(1)}%)`;
    }).join('\n');

    let portfolioRisk = 'healthy';
    let riskComment = "Your portfolio shows an excellent asset distribution, limiting concentration risk while maintaining growth.";
    const cryptoVal = catMap['Cryptocurrency'] || 0;
    const cryptoPct = (cryptoVal / totalCurrent) * 100;
    const equityVal = (catMap['Equity'] || 0) + (catMap['Mutual Funds'] || 0);
    const equityPct = (equityVal / totalCurrent) * 100;

    if (cryptoPct > 20) {
      portfolioRisk = 'high_crypto';
      riskComment = `Cryptocurrency comprises **${cryptoPct.toFixed(1)}%** of your capital value. This exceeds the recommended 5-10% speculative limit, exposing you to severe drawdown risk.`;
    } else if (equityPct > 85) {
      portfolioRisk = 'high_equity';
      riskComment = `Equities represent **${equityPct.toFixed(1)}%** of your capital value. While excellent for long-term compounding, you lack fixed-income buffers or sovereign gold hedges to absorb index corrections.`;
    } else if (Object.keys(catMap).length < 3) {
      portfolioRisk = 'low_diversification';
      riskComment = `Your portfolio is concentrated in only **${Object.keys(catMap).length} categories**. High concentration increases vulnerability to sector-specific shocks.`;
    }

    return buildOutput(
      `Your portfolio of **${holdings.length} assets** is valued at **₹${totalCurrent.toLocaleString('en-IN')}** (Total invested: ₹${totalInvested.toLocaleString('en-IN')}), yielding a net gain of **₹${netPl.toLocaleString('en-IN')} (${plPct.toFixed(2)}%)**.`,
      `Here is your category allocation breakdown:\n${breakdownText}\n\n**Risk Profile Critique:** ${riskComment}`,
      "- High exposure to growth assets enables you to outperform long-term retail inflation.\n- Real-time asset logging allows fast tax-loss harvesting and cost averaging.",
      `- ${portfolioRisk === 'high_crypto' ? 'High cryptocurrency exposure exposes you to sudden 30-50% capital drawdowns.' : portfolioRisk === 'high_equity' ? 'Extreme stock market dependence means a 10% market correction will wipe out standard annual returns.' : 'Low diversification leaves you vulnerable if your major asset category underperforms.'}`,
      portfolioRisk === 'high_crypto'
        ? "Rebalance your capital: systematically sell down cryptocurrency holdings to bring exposure below 10%, and redirect those proceeds into Nifty 50 Index ETFs or Sovereign Gold Bonds."
        : portfolioRisk === 'high_equity'
        ? "Diversify your wealth: shift 15% of your portfolio into high-yield Fixed Deposits or Sovereign Gold Bonds to secure a defensive cushion."
        : "Add defensive assets: buy physical Gold ETFs or AAA-rated corporate debt to expand your asset count to at least 3 categories.",
      `Aapke portfolio me ₹${totalCurrent.toLocaleString('en-IN')} ki investment hai jo ${plPct.toFixed(1)}% profit me hai. ${portfolioRisk === 'high_crypto' ? 'Aapka crypto exposure zyada hai, isse thoda kam karke safe gold ya index funds me lagayein.' : 'Yeh allocation general compounding ke liye behtar hai.'}`,
      portfolioRisk === 'high_crypto' ? ["Suggest asset rebalancing", "Go to Portfolio tab"] : ["How do I build a retirement portfolio?", "Explain mutual funds", "Go to Portfolio tab"]
    );
  }

  // 2. Market News / Falling today
  if (query.includes('falling') || query.includes('down') || query.includes('drop') || query.includes('fall') || (query.includes('why') && (query.includes('market') || query.includes('nifty') || query.includes('sensex') || query.includes('red'))) || (query.includes('today') && query.includes('market')) || query.includes('news') || query.includes('rbi') || query.includes('sebi') || query.includes('ipo')) {
    const isDown = niftyChangeVal < 0;
    const trendLabel = isDown ? "pullback and consolidation phase" : "steady bullish momentum";
    
    return buildOutput(
      `The market is showing a **${trendLabel}** today. NIFTY 50 is trading at **${niftyVal}** (${niftyArrow} ${niftyChangeText}).`,
      `Key factors driving today's market movements include:
- **Valuation Pressure**: Nifty's price-to-earnings (P/E) ratio has expanded near 23x, triggering institutional selling.
- **Global Liquidity Flows**: Foreign Institutional Investors (FIIs) are reallocating emerging market funds to cheaper global assets, while domestic SIP inflows buffer the selling pressure.
- **Interest Rate Environment**: High domestic repo rates (6.50%) have directed conservative liquidity towards corporate debt and high-yield bank FDs.
- **Sector Leaders**: Today's active stocks include ${gainerSummary}.`,
      "- Buying on drops lowers your average purchase price through Rupee Cost Averaging.\n- Pullbacks reset overstretched valuations, presenting excellent long-term entry points for quality large-caps.",
      "- Extended geopolitical tensions could increase energy import costs and pressurize the Rupee.\n- High volatility can trigger panic selling among short-term traders.",
      "Do not panic-sell or halt active SIPs. Continue automated monthly contributions. If you have cash reserves, allocate 10% into low-cost large-cap Index ETFs.",
      `Aaj market ${isDown ? 'red' : 'green'} hai aur Nifty ${niftyVal} par chal raha hai. Panic hone ki zarurat nahi hai, corrections me disciplined buying ka fayda uthayein.`,
      ["Why is Reliance rising?", "Compare HDFC Bank and ICICI Bank", "Best SIP for 10 years?"]
    );
  }

  // 3. Specific stock rise question
  if (query.includes('why is') && (query.includes('rising') || query.includes('up') || query.includes('green'))) {
    const matchedStockName = query.includes('reliance') ? 'RELIANCE' : query.includes('trent') ? 'TRENT' : query.includes('bajaj') ? 'BAJAJFINSV' : query.includes('sbin') ? 'SBIN' : null;
    const stockName = matchedStockName || 'market gainers';
    return buildOutput(
      `Top performing stocks like **${stockName}** are gaining today on high volume, backed by strong quarterly revenue projection cycles.`,
      `The upward movement is driven by:
- **Strong Earnings Guidance**: Corporate results indicate expanded profit margins and positive macro demands.
- **DII & Mutual Fund Support**: Domestic equity funds are actively deploying cash reserves into large-caps.
- **Valuation Comfort**: Valuation resets over the last quarter make current levels highly attractive for institutions.`,
      "- Buying high-momentum stocks adds immediate alpha to portfolios.\n- Strong volumes indicate long-term institutional commitment.",
      "- Fast surges can lead to short-term overvaluation risk.\n- Volatility increases as traders lock in quick profits on highs.",
      "Hold core allocations in quality large-caps. Avoid chasing 5% intraday rallies with fresh capital; instead, accumulate systematically on minor support pullbacks.",
      `Aapne stocks ke badhne ke baare me pucha. ${stockName} aaj top gainers list me hai aur retail demand and institutional volumes is momentum ko support kar rahe hain.`,
      ["Compare HDFC Bank and ICICI Bank", "Best stocks under ₹500?", "Go to Dashboard tab"]
    );
  }

  // 4. Compounding & SIP calculation
  if (query.includes('sip') || query.includes('compounding') || query.includes('saal') || query.includes('monthly') || query.includes('calculator')) {
    if (amount) {
      const yearlyReturn = 0.12;
      const monthlyRate = yearlyReturn / 12;
      const months = duration * 12;
      
      // S = P * [((1 + r)^n - 1) / r] * (1 + r)
      const sipValue = amount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
      const totalInvested = amount * months;
      const returnsEarned = sipValue - totalInvested;

      return buildOutput(
        `A monthly SIP of **₹${amount.toLocaleString('en-IN')}** for **${duration} years** (assuming a baseline 12% CAGR) will accumulate to **₹${Math.round(sipValue).toLocaleString('en-IN')}**.`,
        `Here is the compounding mathematical breakdown:
- **Total Capital Invested**: ₹${totalInvested.toLocaleString('en-IN')}
- **Estimated Wealth Created**: ₹${Math.round(returnsEarned).toLocaleString('en-IN')}
- **Total Future Corpus**: ₹${Math.round(sipValue).toLocaleString('en-IN')}

Due to the nature of compounding, your earnings grow exponentially. The wealth generated in the final 3 years of this ${duration}-year tenure is historically larger than the first 5 years of investments combined.`,
        "- Automates investment discipline, preventing you from attempting to time market peaks.\n- A 10% annual Step-Up SIP can double your final corpus with minimal lifestyle adjustments.",
        "- Returns are market-linked and can fluctuate over short-term holding periods.\n- Pausing SIP contributions during market corrections severely reduces compound gains.",
        "Initiate an automated mandate for your ₹${amount.toLocaleString('en-IN')} SIP. Select direct plans of Flexi-cap or Index mutual funds to minimize expense ratios.",
        `Monthly ₹${amount.toLocaleString('en-IN')} ki SIP ${duration} saal me compound hokar ₹${Math.round(sipValue).toLocaleString('en-IN')} ban sakti hai. Isko start karne ke liye active automate mandate deploy karein.`,
        ["How do I build a retirement portfolio?", "Go to Calculator tab", "What if I invest ₹10,000?"]
      );
    } else {
      return buildOutput(
        `Systematic Investment Plans (SIPs) are the most effective method for retail wealth compounding, allowing you to capture market expansion systematically.`,
        `A standard long-term SIP blueprint includes:
- **Large-Cap/Index Funds (40%)**: For low-cost stable index replication.
- **Flexi-Cap Funds (40%)**: For active allocations across small, mid, and large cap firms.
- **Mid/Small-Cap Funds (20%)**: For aggressive alpha generation, suitable for a 7+ year horizon.

If you specify an amount (e.g. "SIP of ₹5,000 for 10 years"), I will compute your exact compounding schedule and wealth creation path.`,
        "- Removes emotional timing bias from wealth compounding.\n- Allows investment compounding from a low entry barrier of ₹500/month.",
        "- Requires strict long-term discipline; early liquidations incur exit loads and taxes.",
        "Define your target monthly investable surplus, then enter it here to compute your compounding projections.",
        "Agar aap ek specific SIP amount decide karein (jaise ₹5,000 ya ₹10,000), toh main aapke return and corpus ka exact compound sheet generate kar sakta hoon.",
        ["What if I invest ₹5,000?", "What if I invest ₹10,000?", "Go to Calculator tab"]
      );
    }
  }

  // 5. Best Stocks Under ₹500
  if (query.includes('under 500') || query.includes('under ₹500') || query.includes('under rs 500') || query.includes('cheap stock') || query.includes('sasta stock')) {
    return buildOutput(
      "High-quality blue-chip and growth-centric stocks trading below ₹500 per share offer excellent entry points for retail investors.",
      `Here is a selected basket of fundamentally strong NSE stocks under ₹500:
1. **ITC Limited** (~₹430): FMCG market leader, strong cash reserves, and excellent dividend yield.
2. **Tata Steel** (~₹170): Primary infrastructure proxy, leading steel manufacturer with global assets.
3. **Bharat Electronics (BEL)** (~₹280): Public defense electronics giant with a strong government order pipeline.
4. **ONGC** (~₹260): Sovereign energy extraction leader with solid cash flows and dividend metrics.
5. **NHPC Limited** (~₹95): Clean hydroelectric power play with multi-gigawatt capacity expansion.`,
      "- Low share price allows easy position sizing and capital distribution.\n- Strong dividend payouts provide reliable cash inflows during volatile periods.",
      "- PSU stocks (BEL, ONGC) carry sovereign policy and pricing risks.\n- Metal producers (Tata Steel) are highly cyclical and volatile.",
      "Do not buy speculative penny stocks. Allocate your surplus budget across this diversified basket of blue-chip assets.",
      `₹500 ke under fundamentals-strong stocks jaise ITC, Tata Steel ya BEL me invest karna high-risk penny stocks se behtar aur safe hai.`,
      ["Compare HDFC Bank and ICICI Bank", "Explain P/E ratio", "Go to Recommendations tab"]
    );
  }

  // 6. Compare HDFC Bank and ICICI Bank
  if (query.includes('hdfc') || query.includes('icici') || (query.includes('bank') && (query.includes('compare') || query.includes('vs') || query.includes('better')))) {
    return buildOutput(
      "ICICI Bank currently leads private sector banking in growth and Net Interest Margins, while HDFC Bank offers deep long-term value post-merger consolidation.",
      `A metric-driven institutional comparison:
- **Net Interest Margins (NIMs)**: ICICI Bank maintains a superior margin of ~4.3% due to high retail loan penetration. HDFC Bank is consolidating post-merger, with compressed NIMs at ~3.5-3.6%.
- **Valuation Multiples**: HDFC Bank trades near historic lows of ~2.2x Price-to-Book (P/B). ICICI Bank trades at ~2.8x P/B, representing its high-growth premium.
- **Asset Quality**: Both banks exhibit pristine loan books with Net NPAs safely below 1%.`,
      "- ICICI provides near-term growth momentum and digital-first credit advantages.\n- HDFC Bank provides a strong valuation margin of safety for long-term investors.",
      "- High sector-wide competition for deposits is squeezing banking margins.\n- Integration delays could delay HDFC Bank's ROE recovery by a few quarters.",
      "For near-term growth, ICICI Bank is preferred. For value investing over a 3-5 year horizon, accumulate HDFC Bank. Allocate to both in a 60:40 ratio.",
      `ICICI Bank growth ke maamle me aage hai par HDFC Bank low valuations par long-term capital preservation ke liye badhiya value stock hai.`,
      ["Explain P/E ratio", "Why is the market falling today?", "Go to Recommendations tab"]
    );
  }

  // 7. Gold or Equity
  if (query.includes('gold') || query.includes('sona') || query.includes('equity') || (query.includes('stocks') && (query.includes('vs') || query.includes('compare') || query.includes('or')))) {
    return buildOutput(
      "Equities are the engine of capital compounding and wealth creation (12-15% CAGR), while Gold serves as a currency hedge and portfolio insurance (8-10% CAGR) during financial crises.",
      `Asset class roles in portfolio construction:
- **Equities**: Directly backed by corporate earnings and economic growth. Ideal for beat-inflation returns over 5+ year tenures.
- **Gold**: Safe-haven commodity. Historically rallies when equity markets face high volatility, inflation, or geopolitical stress.
Live market trends show that during major corrections, gold holdings cushion overall capital losses.`,
      "- Equities maximize long-term purchasing power expansion.\n- Gold stabilizes the portfolio beta, reducing overall drawdown volatility.",
      "- Equities can suffer severe 20-30% short-term drawdowns.\n- Gold is a non-yield producing asset, offering no regular dividends or interest payouts (except Sovereign Gold Bonds).",
      "Maintain a balanced allocation: allocate 75-80% of your wealth to Equities (via diversified funds) and 15-20% to Gold (via Gold ETFs or SGBs).",
      `Wealth creation ke liye Equities best hain aur Gold portfolio ko crash se bachata hai. Sahi allocation dono me balance rakhna hai.`,
      ["Best SIP for 10 years?", "What are bonds?", "Go to Recommendations tab"]
    );
  }

  // 8. Mutual funds vs ETFs
  if (query.includes('mutual fund') || query.includes('etf') || query.includes('index fund') || query.includes('passive')) {
    return buildOutput(
      "Mutual Funds offer active asset management aiming for benchmark alpha, while Exchange-Traded Funds (ETFs) provide low-cost passive tracking of indices with intraday liquidity.",
      `Key operational differences:
- **Expense Ratios**: Active Mutual Funds charge 1.5% to 2.5% in fees. ETFs charge minimal fees (typically 0.05% to 0.20%).
- **Trading Structure**: ETFs trade live on stock exchanges like individual shares. Mutual Funds are transacted at the end-of-day Net Asset Value (NAV).
- **Manager Performance**: Over a 10-year period, more than 75% of active large-cap mutual fund managers fail to outperform the low-cost Nifty 50 Index.`,
      "- ETFs eliminate manager risk and guarantee index returns.\n- Mutual funds allow automated SIP mandates directly from your bank without needing a demat account.",
      "- Active mutual funds can underperform the index while charging higher management fees.\n- ETFs require a demat account and can experience bid-ask spread liquidity leaks.",
      "For large-cap exposure, purchase low-cost Index ETFs (such as Nifty BeES). For mid-cap and small-cap exposure, select active direct-plan mutual funds.",
      `Large-cap investment ke liye Nifty ETFs sabse saste aur behtar hote hain, jabki mid/small-caps me active mutual funds select karna sahi hoga.`,
      ["Best stocks under ₹500?", "What is an ETF?", "Go to Recommendations tab"]
    );
  }

  // 9. Bonds & Fixed Income
  if (query.includes('bond') || query.includes('fixed income') || query.includes('fd') || query.includes('ppf') || query.includes('fixed deposit')) {
    return buildOutput(
      "Fixed Income assets (Bonds, FDs, PPF) secure capital protection, providing guaranteed yields and defensive cushion against stock market corrections.",
      `Core fixed income asset options:
- **Public Provident Fund (PPF)**: Backed by the Government of India. Offers 7.1% tax-free interest under Section 80C. Sovereign-guaranteed.
- **Bank Fixed Deposits**: Offers 7.0-7.5% interest. Insured up to ₹5 Lakhs per bank under DICGC. Interest is added to taxable income.
- **Corporate Bonds**: Yields 8.5-10.5% interest. Carries credit risk; invest only in 'AAA' or 'AA+' rated papers.`,
      "- Guaranteed interest payments buffer portfolio returns during equity downturns.\n- High capital safety stabilizes your financial net worth.",
      "- FDs are tax-inefficient as interest income is taxed at your income tax slab rate.\n- PPF has lock-in limitations (15-year maturity schedule).",
      "Maintain 20% of your investable portfolio in fixed income, prioritizing PPF for long-term tax-free savings and liquid bank FDs for emergency reserves.",
      `Stable income aur capital safety ke liye debt instruments (jaise PPF ya high-rated corporate bonds) portfolio me zaroor hone chahiye.`,
      ["How do I build a retirement portfolio?", "Should I invest in gold or equity?", "Go to Recommendations tab"]
    );
  }

  // 10. P/E Ratio explanation
  if (query.includes('pe ratio') || query.includes('p/e') || query.includes('ratio') || query.includes('valuation') || query.includes('eps')) {
    return buildOutput(
      "The Price-to-Earnings (P/E) ratio measures valuation, representing how much capital investors are paying for every ₹1 of a company's net earnings.",
      `Understanding P/E valuation metrics:
- **Formula**: Current Stock Price / Earnings Per Share (EPS).
- **Sector Differences**: High-growth sectors (like Software or FMCG) trade at P/E ratios of 40-60x due to high capital efficiency. Cyclical sectors (like Metals or Utilities) trade at 8-15x P/E.
- **PEG Ratio**: Always divide P/E by growth rate. A stock with a P/E of 40 and 40% growth (PEG = 1.0) is cheaper than a stock with P/E of 20 and 5% growth (PEG = 4.0).`,
      "- Helps quickly identify undervalued stock opportunities within the same sector.\n- Simplifies comparative screening against historical index averages.",
      "- P/E does not account for corporate debt leverage on the balance sheet.\n- Earnings can be artificially inflated or reflect one-off asset sales, distorting the P/E ratio.",
      "Never buy a stock based solely on a low P/E ratio. Verify that return on equity (ROE > 15%) and debt-to-equity (< 1.0) are strong.",
      `P/E ratio check karna zaroori hai taki aap mehenge stock bubbles se bach sakein. Hamesha relative sector average check karein.`,
      ["Compare HDFC Bank and ICICI Bank", "Best stocks under ₹500?", "Go to Recommendations tab"]
    );
  }

  // 11. Retirement planning
  if (query.includes('retirement') || query.includes('retire') || query.includes('pension')) {
    return buildOutput(
      "Retirement portfolio planning focuses on building a compounding asset pool to generate structured, inflation-protected monthly payouts when active salary stops.",
      `Standard retirement planning steps:
- **The 25x Rule**: Accumulate a corpus of at least 25 times your projected annual post-retirement expenses.
- **Asset Allocation Glide Path**: Maintain 70% equities in your early compounding years, systematically shifting to a 60% debt and fixed income mix within 3-5 years of retirement.
- **SWP Strategy**: Keep your core retirement corpus in mutual funds and setup a Systematic Withdrawal Plan (SWP) to generate automated tax-efficient monthly income.`,
      "- Guarantees financial self-reliance and shields your family against future emergency health costs.\n- Inflation-hedged equity growth prevents your savings from losing purchasing power over a 20+ year retirement.",
      "- Lock-in constraints in dedicated retirement funds (like NPS or PPF).\n- Early retirement withdrawal penalties and capital erosion due to short-term market crashes.",
      "Start a dedicated retirement equity SIP immediately. Calculate your target annual expenses multiplied by 25. Use the 'Calculator' tab to model step-up options.",
      `Retirement planning ke liye safe investment and compound interest projection zaroori hai. 25x expenses ka corpus build karein.`,
      ["What is the 25x rule?", "What if I invest ₹10,000?", "Go to Calculator tab"]
    );
  }

  // 12. General / Fallback Wealth Advisor
  let fallbackTopic = "capital asset allocation";
  let fallbackDetails = "A structured wealth advisory approach requires evaluating time horizons, asset class correlation, and risk tolerances to optimize returns.";
  if (query.includes('tax')) {
    fallbackTopic = "tax-efficient investing";
    fallbackDetails = "Tax optimization is critical: Equity returns carry a 12.5% Long-Term Capital Gains (LTCG) tax (exemption up to ₹1.25L), while STCG is 20%. Debt interest returns are taxed at your income slab rates. Utilizing tax-exempt structures like PPF or Equity Linked Savings Schemes (ELSS) boosts net CAGR.";
  } else if (query.includes('inflation')) {
    fallbackTopic = "inflation protection";
    fallbackDetails = "Inflation reduces your cash purchasing power by ~6% annually. Safe assets like savings accounts lose value in real terms. Only growth assets like Equities (historically compounding at 12-15%) and Gold (8-10%) consistently outpace long-term inflation.";
  } else if (query.includes('dividend')) {
    fallbackTopic = "dividend yield strategies";
    fallbackDetails = "Dividend yield investing focuses on buying companies with high cash reserves that return profits directly to shareholders. Top dividend payers are typically public sector enterprises (PSUs) like Coal India or ONGC, yielding 5-8% in dividend payouts annually.";
  }

  return buildOutput(
    `An institutional wealth strategy focusing on **${fallbackTopic}** is essential to build sustainable purchasing power.`,
    `${fallbackDetails}\n\nOur current live market indicators show NIFTY 50 trading at **${niftyVal}** (${niftyArrow} ${niftyChangeText}), which provides a key valuation benchmark.`,
    "- Systemic diversification reduces overall drawdowns during market panic events.\n- Rupee cost averaging eliminates the psychological pressure of timing index bottoms.",
    "- Volatility risk associated with equity market cycles.\n- Liquidity constraints in tax-deferred fixed income classes.",
    "Draft a financial plan matching your target time horizon. Deploy 70% of long-term (5+ years) capital into equity SIPs and keep short-term reserves in high-yield debt. Use the 'Portfolio' and 'Calculator' tabs to execute.",
    `Aapke investment query ke baare me: disciplined wealth creation ke liye emergency reserves ke baad dynamic equity mutual funds me SIP lagana best hai.`,
    ["Best SIP for 10 years?", "Review my portfolio allocations", "Go to Dashboard tab"]
  );
};

const renderMarkdown = (text) => {
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    let cleanLine = line;
    let isHeader = false;
    let isBullet = false;
    
    if (cleanLine.startsWith('### ')) {
      isHeader = true;
      cleanLine = cleanLine.substring(4);
    } else if (cleanLine.startsWith('## ')) {
      isHeader = true;
      cleanLine = cleanLine.substring(3);
    } else if (cleanLine.startsWith('- ') || cleanLine.startsWith('* ')) {
      isBullet = true;
      cleanLine = cleanLine.substring(2);
    }
    
    // Parse bold text **word**
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = boldRegex.exec(cleanLine)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ text: cleanLine.substring(lastIndex, match.index), isBold: false });
      }
      parts.push({ text: match[1], isBold: true });
      lastIndex = boldRegex.lastIndex;
    }
    
    if (lastIndex < cleanLine.length) {
      parts.push({ text: cleanLine.substring(lastIndex), isBold: false });
    }
    
    const renderedLine = parts.map((p, pIdx) => (
      p.isBold ? <strong key={pIdx} style={{ color: 'var(--text-main)', fontWeight: 800 }}>{p.text}</strong> : p.text
    ));
    
    if (isHeader) {
      return (
        <div key={idx} style={{ 
          fontWeight: 800, 
          fontSize: '0.92rem', 
          color: 'var(--primary)', 
          marginTop: '0.85rem', 
          marginBottom: '0.35rem',
          borderBottom: '1px solid rgba(37, 99, 235, 0.08)',
          paddingBottom: '2px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          {renderedLine}
        </div>
      );
    }
    
    if (isBullet) {
      return (
        <div key={idx} style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          gap: '6px', 
          fontSize: '0.82rem', 
          margin: '0.25rem 0',
          paddingLeft: '0.5rem',
          color: 'var(--text-muted)'
        }}>
          <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>•</span>
          <div style={{ flex: 1, lineHeight: 1.45 }}>{renderedLine}</div>
        </div>
      );
    }
    
    // If it's a disclaimer, format it differently
    if (cleanLine.toLowerCase().includes('disclaimer') || cleanLine.toLowerCase().includes('educational purposes')) {
      return (
        <div key={idx} style={{
          display: 'flex',
          gap: '6px',
          alignItems: 'flex-start',
          background: 'rgba(239, 68, 68, 0.04)',
          border: '1px dashed rgba(239, 68, 68, 0.15)',
          padding: '0.65rem 0.85rem',
          borderRadius: '8px',
          fontSize: '0.72rem',
          color: 'var(--text-light)',
          marginTop: '0.85rem',
          lineHeight: 1.4
        }}>
          <AlertTriangle size={12} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--danger)' }} />
          <div>
            <strong style={{ color: 'var(--danger)', fontWeight: 800 }}>SEBI Disclaimer: </strong>
            {renderedLine}
          </div>
        </div>
      );
    }
    
    if (cleanLine.trim() === '') {
      return <div key={idx} style={{ height: '0.5rem' }} />;
    }
    
    return (
      <p key={idx} style={{ 
        margin: '0.4rem 0', 
        fontSize: '0.82rem', 
        lineHeight: 1.5, 
        color: 'var(--text-muted)' 
      }}>
        {renderedLine}
      </p>
    );
  });
};

const AdvisorAvatarSVG = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <defs>
      <radialGradient id="avatarGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" stopColor="#10b981" stopOpacity="0.6"/>
        <stop offset="100%" stopColor="#2563eb" stopOpacity="0"/>
      </radialGradient>
      <linearGradient id="faceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95"/>
        <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.8"/>
      </linearGradient>
      <linearGradient id="visorGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#2563eb"/>
        <stop offset="50%" stopColor="#06b6d4"/>
        <stop offset="100%" stopColor="#10b981"/>
      </linearGradient>
      <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.12"/>
      </filter>
    </defs>
    
    <circle cx="32" cy="32" r="28" fill="url(#avatarGlow)" />
    <path d="M14 26C14 16 22 10 32 10C42 10 50 16 50 26C50 36 46 44 32 44C18 44 14 36 14 26Z" fill="url(#faceGrad)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" filter="url(#softShadow)" />
    <rect x="20" y="21" width="24" height="7" rx="3.5" fill="url(#visorGrad)" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
    <rect x="22" y="22" width="10" height="1.5" rx="0.75" fill="#ffffff" fillOpacity="0.6" />
    <circle cx="26" cy="24.5" r="1.5" fill="#ffffff" />
    <circle cx="38" cy="24.5" r="1.5" fill="#ffffff" />
    <path d="M32 10V16" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="32" cy="17" r="1.5" fill="#10b981" />
    <path d="M26 12C26 14.5 24 16.5 24 16.5" stroke="#2563eb" strokeWidth="1" strokeLinecap="round" />
    <circle cx="23.5" cy="18" r="1" fill="#2563eb" />
    <path d="M38 12C38 14.5 40 16.5 40 16.5" stroke="#10b981" strokeWidth="1" strokeLinecap="round" />
    <circle cx="40.5" cy="18" r="1" fill="#10b981" />
    <path d="M27 34C27 36 29 38 32 38C35 38 37 36 37 34" stroke="url(#visorGrad)" strokeWidth="2" strokeLinecap="round" />
    <path d="M32 4L34 7L38 8L35 10L36 13L32 11L28 13L29 10L26 8L30 7L32 4Z" fill="#fb923c" opacity="0.95" />
  </svg>
);

const Chatbot = ({ marketData = {}, topGainers = [], setActiveTab, user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: "👋 Hi, I'm Prefin\n\nI can help you with:\n\n• Stocks\n• Mutual Funds\n• SIP Planning\n• Bonds\n• Portfolio Analysis\n• Market News\n• Investment Strategies\n\nAsk me anything." }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [followUps, setFollowUps] = useState([
    "What should I invest ₹50,000 in for 10 years?",
    "Review my portfolio allocations",
    "Why is the stock market falling today?",
    "Compare HDFC Bank and ICICI Bank"
  ]);
  
  const [context, setContext] = useState({ amount: null, duration: null, risk: 'medium' });

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user) {
      setMessages(prev => {
        if (prev.length === 1 && (prev[0].id === 1 || prev[0].text.startsWith('Hello') || prev[0].text.startsWith('👋'))) {
          const firstName = user.name ? user.name.split(' ')[0] : 'there';
          return [{
            id: 1,
            sender: 'bot',
            text: `👋 Hi ${firstName}, I'm Prefin\n\nI can help you with:\n\n• Stocks\n• Mutual Funds\n• SIP Planning\n• Bonds\n• Portfolio Analysis\n• Market News\n• Investment Strategies\n\nAsk me anything.`
          }];
        }
        return prev;
      });
    } else {
      setMessages(prev => {
        if (prev.length === 1 && (prev[0].id === 1 || prev[0].text.startsWith('Hello') || prev[0].text.startsWith('👋'))) {
          return [{
            id: 1,
            sender: 'bot',
            text: "👋 Hi, I'm Prefin\n\nI can help you with:\n\n• Stocks\n• Mutual Funds\n• SIP Planning\n• Bonds\n• Portfolio Analysis\n• Market News\n• Investment Strategies\n\nAsk me anything."
          }];
        }
        return prev;
      });
    }
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (text) => {
    if (!text.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);
    setFollowUps([]); // clear follow ups while processing

    setTimeout(() => {
      // Pass local context state to advisor response generator
      const updatedContext = { ...context };
      const result = getWealthAdvisorResponse(text, updatedContext, marketData, topGainers);
      
      // Update context in state
      setContext(updatedContext);

      const botMsg = { id: Date.now() + 1, sender: 'bot', text: result.text };
      setMessages(prev => [...prev, botMsg]);
      setFollowUps(result.followUps || []);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            background: 'linear-gradient(135deg, rgba(37,99,235,0.95) 0%, rgba(16,185,129,0.95) 100%)',
            border: '1.5px solid rgba(255, 255, 255, 0.25)',
            borderRadius: '50px',
            width: '64px',
            height: '64px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 0
          }}
          title="Consult AI Wealth Advisor"
          className="advisor-avatar-btn"
        >
          <AdvisorAvatarSVG size={38} />
        </button>
      )}

      {/* Chat Window Panel overlay */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '440px',
            height: '620px',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-glass)',
            boxShadow: 'var(--shadow-lg), 0 10px 40px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 9999,
            animation: 'fadeIn 0.3s ease'
          }}
        >
          {/* Header */}
          <div 
            className="chat-header-glow"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(245, 250, 255, 0.85) 50%, rgba(247, 244, 255, 0.8) 100%)',
              backdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
              boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.7), 0 2px 10px rgba(0, 0, 0, 0.02)',
              color: 'var(--text-main)',
              padding: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', padding: '0.15rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                <AdvisorAvatarSVG size={32} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.92rem', margin: 0, fontWeight: 800, color: 'var(--text-main)' }}>Prefin Wealth Advisor</h4>
                <span style={{ fontSize: '0.72rem', color: 'var(--success)', fontWeight: 700 }}>
                  🟢 AI Wealth Advisor Online
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-light)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '50%' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; e.currentTarget.style.color = 'var(--text-main)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-light)'; }}
            >
              <Minimize2 size={16} />
            </button>
          </div>

          {/* Messages list area */}
          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(248, 250, 252, 0.5)' }}>
            {messages.map(msg => {
              const isBot = msg.sender === 'bot';
              return (
                <div key={msg.id} style={{ display: 'flex', gap: '0.5rem', alignSelf: isBot ? 'flex-start' : 'flex-end', maxWidth: '92%', alignItems: 'flex-start' }}>
                  {isBot && (
                    <div style={{ background: 'rgba(37,99,235,0.04)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <AdvisorAvatarSVG size={24} />
                    </div>
                  )}
                  <div style={{
                    background: isBot ? '#ffffff' : 'var(--primary)',
                    color: isBot ? 'var(--text-main)' : '#ffffff',
                    border: isBot ? '1px solid var(--border-light)' : 'none',
                    padding: '0.75rem 1rem',
                    borderRadius: isBot ? '0 16px 16px 16px' : '16px 0 16px 16px',
                    fontSize: '0.85rem',
                    lineHeight: 1.5,
                    boxShadow: isBot ? '0 2px 8px rgba(0,0,0,0.02)' : 'none',
                    fontWeight: 500,
                    width: isBot ? '100%' : 'auto'
                  }}>
                    {isBot ? renderMarkdown(msg.text) : msg.text}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div style={{ display: 'flex', gap: '0.5rem', alignSelf: 'flex-start', alignItems: 'center' }}>
                <div style={{ background: 'rgba(37,99,235,0.04)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <AdvisorAvatarSVG size={24} />
                </div>
                <div style={{ background: '#ffffff', border: '1px solid var(--border-light)', padding: '0.5rem 1rem', borderRadius: '0 16px 16px 16px', display: 'flex', gap: '4px' }}>
                  <span className="dot-blink" style={{ width: '6px', height: '6px', background: 'var(--text-light)', borderRadius: '50%', display: 'inline-block' }} />
                  <span className="dot-blink" style={{ width: '6px', height: '6px', background: 'var(--text-light)', borderRadius: '50%', display: 'inline-block', animationDelay: '0.2s' }} />
                  <span className="dot-blink" style={{ width: '6px', height: '6px', background: 'var(--text-light)', borderRadius: '50%', display: 'inline-block', animationDelay: '0.4s' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Dynamic Follow-up Suggestions Pilled Row */}
          {followUps.length > 0 && (
            <div style={{ 
              padding: '0.5rem 0.75rem', 
              display: 'flex', 
              gap: '0.4rem', 
              flexWrap: 'wrap', 
              borderTop: '1px solid rgba(0,0,0,0.04)', 
              background: '#ffffff' 
            }}>
              {followUps.map((fu, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (fu.startsWith('Go to ')) {
                      const tab = fu.replace('Go to ', '').replace(' tab', '').toLowerCase();
                      if (setActiveTab) setActiveTab(tab);
                    } else {
                      handleSendMessage(fu);
                    }
                  }}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '20px',
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.72rem',
                    color: 'var(--primary)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--primary-glow)';
                    e.currentTarget.style.borderColor = 'rgba(37,99,235,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  {fu}
                </button>
              ))}
            </div>
          )}

          {/* Input control footer */}
          <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', gap: '0.5rem', background: '#ffffff' }}>
            <div className="input-field-wrapper" style={{ flex: 1, padding: '0 0.5rem', borderRadius: '12px' }}>
              <input
                type="text"
                className="input-field"
                placeholder="Ask Coach Alpha 'best mutual fund for ₹10,000 saal'..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                style={{ fontSize: '0.85rem' }}
              />
            </div>
            <button
              onClick={() => handleSendMessage(inputValue)}
              style={{
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes dotBlink {
          0%, 100% { opacity: 0.3; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        .dot-blink {
          animation: dotBlink 1s infinite ease-in-out;
        }
        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 8px 32px rgba(37, 99, 235, 0.25), 0 0 10px rgba(16, 185, 129, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.2);
          }
          50% {
            box-shadow: 0 12px 40px rgba(37, 99, 235, 0.45), 0 0 20px rgba(16, 185, 129, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.3);
          }
        }
        @keyframes breathing {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-4px) scale(1.02);
          }
        }
        .advisor-avatar-btn {
          animation: breathing 4s ease-in-out infinite, pulseGlow 3s ease-in-out infinite;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          backdrop-filter: blur(8px);
        }
        .advisor-avatar-btn:hover {
          transform: translateY(-6px) scale(1.08) !important;
          box-shadow: 0 16px 48px rgba(37, 99, 235, 0.55), 0 0 25px rgba(16, 185, 129, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.4) !important;
          animation-play-state: paused;
        }
        .chat-header-glow {
          transition: all 0.3s ease;
        }
        .chat-header-glow:hover {
          box-shadow: inset 0 1px 1px rgba(255,255,255,0.9), 0 4px 20px rgba(37, 99, 235, 0.04) !important;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 250, 255, 0.9) 50%, rgba(247, 244, 255, 0.85) 100%) !important;
        }
      `}</style>
    </>
  );
};

export default Chatbot;
