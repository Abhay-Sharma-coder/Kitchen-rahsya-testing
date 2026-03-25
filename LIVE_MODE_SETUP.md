# 🚀 Live Mode Setup Guide - Razorpay Integration

After testing the payment flow in **Test Mode**, follow these steps to switch to **Live Mode** for production.

---

## ✅ Pre-Live Checklist

- [ ] Test payment flow completed successfully in Test Mode
- [ ] Verified webhook events received in Razorpay dashboard
- [ ] Admin payment history page shows all test transactions
- [ ] Verified order confirmation flow works end-to-end
- [ ] Have test data backed up or documented

---

## 📋 Step-by-Step Live Mode Transition

### **Step 1: Verify Production Environment**

Make sure your deployment is production-ready:
- ✅ Site URL: `https://kr-testing.vercel.app` (or your live domain)
- ✅ Database: MongoDB Atlas kitchen_rahsya connected
- ✅ Authentication: Admin & customer accounts working
- ✅ Backend APIs: All `/api/` routes responding correctly

### **Step 2: Switch Razorpay to Live Mode**

1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. **In the bottom left sidebar**, toggle from **Test Mode** → **Live Mode**
3. A dialog will appear warning about switching to production
4. Click **"Yes, I understand this is for LIVE TRANSACTIONS"**

### **Step 3: Generate Live API Keys**

1. Go to **Settings** → **API Keys** (or **Websites & API keys**)
2. You'll see both **Test** and **Live** sections
3. Under **Live** section:
   - Copy **Key ID** (starts with `rzp_live_...`)
   - Copy **Key Secret** (long encrypted string)
4. **Keep these values safe** - write them down or use a password manager

**Example Live Keys (format, not real):**
```
RAZORPAY_KEY_ID = rzp_live_1234567890abcd
RAZORPAY_KEY_SECRET = abcdefghijklmnopqrstuvwxyz123456789...
```

### **Step 4: Create Live Webhook**

1. Stay in Razorpay Dashboard (Live Mode ON)
2. Go to **Settings** → **Webhooks**
3. Click **"+ Add New Webhook"**
4. Configure:
   - **Webhook URL**: `https://kr-testing.vercel.app/api/payments/webhook`
   - **Events**: Select BOTH:
     - ✓ `payment.captured`
     - ✓ `payment.failed`
   - **Active**: Ensure toggle is ON
5. Click **"Generate Secret"** button
6. **Copy the webhook secret** (appears once, save it securely!)
7. Click **"Add Webhook"**

**Expected Webhook Secret Format:**
```
whsec_abcdefg1234567890abcdefghijklmno+xyz
```

### **Step 5: Update Vercel Environment Variables**

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your project: **Kitchen-rahsya-testing** (or your live project)
3. Click **Settings** → **Environment Variables**
4. **Delete or replace** the test values with live values:

| Variable Name | Old Value (Test) | New Value (Live) |
|---|---|---|
| `RAZORPAY_KEY_ID` | `rzp_test_...` | `rzp_live_...` |
| `RAZORPAY_KEY_SECRET` | Test secret | Live secret |
| `RAZORPAY_WEBHOOK_SECRET` | Test webhook secret | Live webhook secret |

**Update each variable:**

1. Find `RAZORPAY_KEY_ID` → Click it → Update value → Save
2. Find `RAZORPAY_KEY_SECRET` → Click it → Update value → Save
3. Find `RAZORPAY_WEBHOOK_SECRET` → Click it → Update value → Save

**Do NOT change** (keep existing):
- `MONGODB_URI` ✓
- `JWT_SECRET` ✓
- `NEXT_PUBLIC_*` variables ✓

### **Step 6: Trigger Vercel Redeployment**

1. After updating env variables, Vercel will show a **Redeploy** button
2. Click **"Redeploy"** to rebuild with new environment variables
3. Wait for deployment to complete (2-3 minutes)
4. Verify deployment successful (green checkmark)

### **Step 7: Verify Live Configuration**

1. Go to your live site: `https://kr-testing.vercel.app`
2. Open browser **Developer Console** (F12 → Console tab)
3. Perform test transactions with **REAL PAYMENT CARDS**:
   - Use any valid credit/debit card from your bank
   - Small amount (₹1-10 recommended for first test)
   - Real UPI ID for UPI testing
   - Real phone number for netbanking

**Test Flow:**
1. Add product to cart
2. Checkout → Select **"Online Payment"**
3. Review order → Confirm
4. **Razorpay modal opens** → Select payment method
5. **Complete payment** (will actually charge your card!)
6. **Verify in Razorpay Dashboard** → Transactions should show as LIVE
7. **Check order status** → Should be `paid + confirmed`

### **Step 8: Verify Webhook Integration**

1. In Razorpay Dashboard → **Webhooks** (Live Mode)
2. Click on your webhook URL
3. Check **Recent Events** tab
4. Should see successful `payment.captured` events after each live test

**What webhook events mean:**
- ✅ `payment.captured` = Payment succeeded, order confirmed
- ❌ `payment.failed` = Payment failed, order status updated

### **Step 9: Monitor & Reconcile**

1. **Admin Dashboard** → **Payments** (new page)
   - Should show all live transactions
   - Filter by status (Paid, Pending, Failed)
   - View full payment details including transaction IDs

2. **Razorpay Dashboard** → **Transactions**
   - Compare order totals with your system
   - Verify captured amounts match

3. **Production Logs** (Optional)
   - Check Vercel logs for any webhook errors
   - Verify `/api/payments/webhook` shows 200 responses

---

## 🔑 Environment Variables Reference

### Test Mode (Already Set)
```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=whsec_testxxxxx
```

### Live Mode (After Setup)
```env
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=whsec_livexxxxx
```

**Location in Vercel:**
- Project → Settings → Environment Variables
- Visible only to production deployments

---

## 📞 Testing Payment Methods

Once in Live Mode, test these payment methods with live details:

### 1. **Credit/Debit Card**
- Use your personal valid card
- Test successful transaction
- Test failed transaction (use expired card)

### 2. **UPI**
- Use your actual UPI ID (e.g., yourname@okhdfcbank)
- Complete payment in your bank's UPI app
- Verify notification received

### 3. **Net Banking**
- Select your bank
- Login with your bank credentials (use test credentials if available)
- Authorize payment

### 4. **Wallets** (PhonePe, Paytm, Google Pay)
- If wallet is linked to your account
- Complete payment through wallet app

---

## ⚠️ Important Safety Notes

1. **API Keys Security**
   - Never commit live keys to GitHub
   - Never share webhook secret publicly
   - Rotate keys quarterly
   - Use Vercel environment variables (not .env files)

2. **Webhook URL**
   - Must be HTTPS (not HTTP)
   - Must be publicly accessible
   - Razorpay IPs must be whitelisted (if applicable)

3. **PCI Compliance**
   - Never store full card numbers
   - Razorpay handles tokenization
   - Use server-side verification (already implemented)

4. **Testing Real Cards**
   - Use small amounts (₹1-10) for initial tests
   - Only test with cards you own
   - Don't test with someone else's payment method
   - Save transaction receipts for auditing

---

## 🐛 Troubleshooting Live Mode Issues

### Issue: "Invalid Key ID"
**Cause:** Still using test keys after switching to Live Mode
**Fix:** 
1. Verify you copied the LIVE key ID (rzp_live_...)
2. Check Vercel environment variables are updated
3. Force Vercel redeploy

### Issue: Webhook Not Receiving Events
**Cause:** Webhook URL incorrect or secret mismatch
**Fix:**
1. Verify webhook URL in Razorpay matches your live domain
2. Check webhook secret in Vercel matches Razorpay exactly
3. Check Vercel logs for `/api/payments/webhook` errors
4. Ensure payment goes through successfully before webhook triggers

### Issue: Payment Succeeds but Order Not Confirmed
**Cause:** Webhook verification failed silently
**Fix:**
1. Check `paymentStatus` in admin orders (might be "failed")
2. Verify webhook secret matches character-for-character
3. Check server logs for signature verification errors
4. Re-create webhook with new secret

### Issue: "Payment Failed" Without Actual Error
**Cause:** Gateway credentials issue
**Fix:**
1. Log out and back into Razorpay dashboard
2. Verify still in Live Mode (toggle in bottom left)
3. Re-copy API keys (no trailing spaces!)
4. Update Vercel env variables again
5. Force redeploy

---

## 📊 Live Mode Monitoring Checklist

**Daily:**
- ✓ Check recent transactions on Razorpay dashboard
- ✓ Verify order statuses in admin panel
- ✓ Monitor payment success rate

**Weekly:**
- ✓ Reconcile total amounts between Razorpay and your DB
- ✓ Check for failed payments and contact customers
- ✓ Review webhook delivery logs

**Monthly:**
- ✓ Full transaction audit
- ✓ Settlement amount verification
- ✓ Refund processing if needed

---

## 🎯 Rollback to Test Mode

If you need to revert to test mode:

1. In Razorpay Dashboard → Toggle back to **Test Mode**
2. Update Vercel environment variables with **test keys**
3. Redeploy Vercel
4. Test functionality in test mode again

*Note: Test mode and live mode are completely isolated - transactions don't mix*

---

## ✅ Completion Checklist

After following all steps, verify:

- [ ] Razorpay dashboard shows "Live Mode" status
- [ ] Live API keys visible in Razorpay (Settings → API Keys)
- [ ] Vercel environment variables updated with live keys
- [ ] Vercel redeploy completed successfully
- [ ] Test transaction completed with real card/UPI
- [ ] Order shows in admin panel with status "paid + confirmed"
- [ ] Admin Payments page shows all live transactions
- [ ] Webhook events visible in Razorpay dashboard
- [ ] No errors in Vercel logs
- [ ] Production site confirmed working

---

## 📞 Support Resources

- **Razorpay Docs:** https://razorpay.com/docs/
- **Razorpay Dashboard:** https://dashboard.razorpay.com
- **Vercel Docs:** https://vercel.com/docs
- **Your Site:** https://kr-testing.vercel.app/admin/payments

---

**Last Updated:** March 25, 2026
**Next Review:** After first 10 live transactions
