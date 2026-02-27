# Integrating Parcel Tracker into Your Shopify Store

## Option 1: Embed as iFrame (Easiest)

Add this code to your Shopify theme's order tracking page:

### In Shopify Admin

1. Go to **Sales Channels** → **Online Store** → **Themes**
2. Click **Actions** → **Edit Code**
3. Find `order.liquid` in the templates folder (or create a custom template)
4. Add this code where you want the tracker to appear:

```liquid
<div class="parcel-tracker-container">
  <iframe 
    src="https://shopify-parcel-tracker.vercel.app" 
    style="width: 100%; 
           height: 700px; 
           border: none; 
           border-radius: 8px;
           margin: 20px 0;"
    title="Parcel Tracker">
  </iframe>
</div>

<style>
  .parcel-tracker-container {
    max-width: 700px;
    margin: 30px auto;
  }
  
  @media (max-width: 480px) {
    .parcel-tracker-container iframe {
      height: 600px;
    }
  }
</style>
```

---

## Option 2: Show on Customer Accounts Page

### Modify `customer-account.liquid`

```liquid
{% if customer %}
  <div class="customer-orders">
    <!-- Your existing content -->
    
    {% if order.tracking_number %}
      <div class="order-tracking">
        <h3>Track Your Package</h3>
        
        <iframe 
          src="https://shopify-parcel-tracker.vercel.app?tracking={{ order.tracking_number }}" 
          style="width: 100%; height: 600px; border: none; border-radius: 8px;">
        </iframe>
      </div>
    {% endif %}
  </div>
{% endif %}
```

---

## Option 3: Custom Shopify App (Advanced)

Create a full Shopify app that shows the tracker:

### Step 1: Generate Shopify App

```bash
npm create @shopify/app@latest -- --template=node

# Follow prompts
# Select: Remix template
```

### Step 2: Add Tracker Component

In your Remix route:

```jsx
// app/routes/index.jsx
import { TrackingWidget } from '../components/TrackingWidget';

export default function Index() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Parcel Tracker</h1>
      <TrackingWidget />
    </div>
  );
}
```

### Step 3: Deploy

```bash
npm run build
npm run deploy
```

---

## Option 4: Add as Button to Order Page

Show a "Track Package" button that opens the tracker:

```liquid
<!-- Add to order.liquid -->

{% if order.tracking_number %}
  <button 
    onclick="openTracker('{{ order.tracking_number }}')"
    class="button"
  >
    📦 Track Your Package
  </button>
  
  <modal id="tracker-modal" class="modal" style="display: none;">
    <div class="modal-content">
      <span class="close" onclick="closeTracker()">&times;</span>
      <iframe 
        id="tracker-iframe"
        style="width: 100%; height: 700px; border: none;">
      </iframe>
    </div>
  </modal>
  
  <script>
    function openTracker(tracking) {
      document.getElementById('tracker-iframe').src = 
        'https://shopify-parcel-tracker.vercel.app?tracking=' + tracking;
      document.getElementById('tracker-modal').style.display = 'block';
    }
    
    function closeTracker() {
      document.getElementById('tracker-modal').style.display = 'none';
    }
    
    window.onclick = function(e) {
      const modal = document.getElementById('tracker-modal');
      if (e.target === modal) modal.style.display = 'none';
    }
  </script>
  
  <style>
    .modal {
      position: fixed;
      z-index: 1000;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0,0,0,0.4);
    }
    
    .modal-content {
      background-color: white;
      margin: 5% auto;
      padding: 20px;
      border-radius: 8px;
      width: 90%;
      max-width: 700px;
      max-height: 90vh;
      overflow: auto;
    }
    
    .close {
      color: #aaa;
      float: right;
      font-size: 28px;
      font-weight: bold;
      cursor: pointer;
    }
    
    .close:hover {
      color: black;
    }
  </style>
{% else %}
  <p class="notification">Tracking number not available yet</p>
{% endif %}
```

---

## Option 5: API Integration (For Developers)

Call the API directly from JavaScript:

```javascript
// Get tracking data
async function trackPackage(trackingNumber) {
  const response = await fetch('https://shopify-parcel-tracker.vercel.app/api/tracking', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      trackingNumber: trackingNumber
    })
  });
  
  const data = await response.json();
  
  // Display data
  console.log('Status:', data.status);
  console.log('Location:', data.location);
  console.log('EDD:', data.estimatedDelivery);
  console.log('Carrier:', data.carrier);
  
  // Render to page
  displayTracking(data);
}

function displayTracking(data) {
  const html = `
    <div class="tracking-info">
      <h3>${data.trackingNumber}</h3>
      <p>Status: <strong>${data.status}</strong></p>
      <p>Location: ${data.location}</p>
      <p>Carrier: ${data.carrier}</p>
      <p>Delivery: ${data.estimatedDelivery}</p>
      
      <h4>Timeline:</h4>
      <ul>
        ${data.events.map(e => `
          <li>
            <strong>${e.date}</strong>: ${e.description}
            ${e.location ? `<br/><em>${e.location}</em>` : ''}
          </li>
        `).join('')}
      </ul>
    </div>
  `;
  
  document.getElementById('tracking-container').innerHTML = html;
}
```

---

## Test Integration

### 1. Test Locally

```bash
# Terminal 1: Run tracker
npm run dev
# http://localhost:3000

# Terminal 2: Test iFrame URL
curl http://localhost:3000

# Terminal 3: Test API
curl -X POST http://localhost:3000/api/tracking \
  -H "Content-Type: application/json" \
  -d '{"trackingNumber":"1Z999AA10123456784"}'
```

### 2. Test with Real Shopify Store

1. Add your deployed tracker URL to your Shopify theme
2. Create a test order with real tracking number
3. Test the tracker widget
4. Verify on mobile

### 3. Test Tracking Numbers

Some real examples to try:
- German carriers: Often start with numbers
- French carriers: Try Chronopost, DPD formats
- International: 1Z... (UPS format)

---

## Customization for Your Store

### Match Your Store's Branding

Edit `components/TrackingWidget.tsx` to use your colors:

```tsx
// Change status colors
.statusDelivered {
    background: #YOUR_COLOR;
    color: #YOUR_TEXT_COLOR;
}

// Change button color
.button {
    background: #YOUR_BRAND_COLOR;
}
```

### Add Your Store Logo

```liquid
<!-- In iFrame or page -->
<img src="{{ shop.logo }}" alt="{{ shop.name }}" />
```

### Change Language

Edit `components/TrackingWidget.tsx`:

```tsx
placeholder="Enter your tracking number..." // English
// Change to your language
```

---

## Troubleshooting

### iFrame not loading

- Check your Shopify theme allows iFrames
- Check browser console for CORS errors
- Try the direct URL in browser first

### Tracking not found

- Verify the tracking number is in Parcelsapp database
- Some carriers may not be supported
- Check if Parcelsapp.com is accessible in your region

### Slow loading

- First request takes 500-1500ms (normal)
- Check your Shopify store performance
- Consider lazy-loading the iFrame

---

## Best Practices

✅ **Do:**
- Test with real tracking numbers
- Show tracker on order confirmation page
- Include in order status email
- Make it easy to find on mobile

❌ **Don't:**
- Use in checkout (too slow)
- Load multiple trackers on same page
- Assume all tracking numbers work

---

## Support

Having issues with integration?

1. Test the tracker in isolation: https://shopify-parcel-tracker.vercel.app
2. Check browser console for errors
3. Verify your tracking number format
4. Check Parcelsapp.com directly for the number
5. Open a GitHub issue with details

---

## Next Steps

1. Choose integration option (iFrame is easiest)
2. Add code to your Shopify theme
3. Test with real orders
4. Monitor customer feedback
5. Iterate based on usage

Happy tracking! 📦
