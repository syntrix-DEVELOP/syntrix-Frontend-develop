// data.js
window.getSectionTitle = function(section) { 
  return section.title || "Consumer Research Matrix"; 
};

window.getSurveyData = function() {
  return [
    {
      id: "sec_1",
      title: "Module 1: Discovery & Purchase Triggers",
      subtitle: "Evaluate how you research, compare, and validate products online.",
      questions: [
        {
          id: "q_ecom_search",
          question: "1. Where do you start when looking for electronics, gadgets, or lifestyle goods?",
          options: [
            "Technical benchmark tests, spec sheets, and deep-dive Reddit threads.",
            "Aesthetic Instagram lookbooks, curated Pinterest boards, or design edits.",
            "Amazon/Flipkart top-rated lists with verified brand warranties.",
            "Creator reviews on YouTube, tech unboxings, or friend recommendations."
          ]
        },
        {
          id: "q_ecom_sale_trigger",
          question: "2. What convinces you to buy during major festive sales (Prime Day / Big Billion Days)?",
          options: [
            "Stacking credit card offers (10% instant bank discounts) to hit lowest price.",
            "Limited-edition design capsules or aesthetic drops that rarely discount.",
            "Bundled protection plans, extended warranties, or no-cost EMI terms.",
            "Viral flash deals trending in community channels or Telegram groups."
          ]
        },
        {
          id: "q_ecom_delivery",
          question: "3. When ordering online, which delivery preference matters most to you?",
          options: [
            "Standard tracked shipping—I refuse to pay convenience fees for fast dispatch.",
            "Pristine, tamper-proof packaging ensuring the product arrives in mint condition.",
            "Open-Box Delivery or doorstep inspection before confirming receipt.",
            "Ultra-fast fulfillment via 10-to-30 minute quick commerce (Blinkit/Zepto)."
          ]
        },
        {
          id: "q_ecom_reviews",
          question: "4. How do you separate authentic product quality from paid sponsor hype?",
          options: [
            "Filtering by critical 2-star & 3-star reviews and searching Reddit for faults.",
            "Scanning user-uploaded photos to inspect real-world colors and build finish.",
            "Checking verified buyer badges, seller return track records, and return windows.",
            "Reading top comments on video reviews to see unedited community consensus."
          ]
        }
      ]
    },
    {
      id: "sec_2",
      title: "Module 2: Checkout, Trust & Brand Loyalty",
      subtitle: "Evaluate what drives checkout conversion, payment trust, and repeat purchases.",
      questions: [
        {
          id: "q_ecom_abandon",
          question: "5. What instantly causes you to abandon an item at the final checkout screen?",
          options: [
            "Unexpected platform handling fees or delivery charges that skew the value.",
            "A cluttered, outdated checkout interface that feels untrustworthy.",
            "Lack of secure buyer protection, missing return policy, or disabled COD.",
            "A quick chat with friends or community groups warning against the brand."
          ]
        },
        {
          id: "q_ecom_payment",
          question: "6. Which payment method gives you the highest confidence with a new brand?",
          options: [
            "Co-branded cashback credit cards to maximize points and dispute protection.",
            "Sleek 1-click biometric payments (Apple Pay / Google Pay / saved tokenized cards).",
            "Cash on Delivery (COD) or Pay-on-Delivery UPI after inspecting the box.",
            "Instant direct UPI QR scan—frictionless, quick, and verified on my phone."
          ]
        },
        {
          id: "q_ecom_loyalty",
          question: "7. What turns a one-time purchase into permanent repeat brand loyalty?",
          options: [
            "Rock-solid durability and specifications that outlast the price paid.",
            "Distinctive aesthetic identity, premium unboxing, and design detail.",
            "Frictionless replacement policies and prompt customer service via WhatsApp.",
            "An authentic founder story, transparent mission, and active community."
          ]
        },
        {
          id: "q_ecom_impulse",
          question: "8. What is most likely to trigger an unplanned, instant purchase from you?",
          options: [
            "An undeniable pricing glitch or verified historical low on a price tracker.",
            "A visually striking item that elevates your workspace, wardrobe, or setup.",
            "A risk-free trial offer with guaranteed free doorstep returns.",
            "A product going viral on your feed that everyone is currently talking about."
          ]
        }
      ]
    }
  ];
};
