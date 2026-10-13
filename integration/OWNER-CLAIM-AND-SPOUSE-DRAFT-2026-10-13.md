# Draft: Ajay confirms his own entry and proposes Dr. Shagun as spouse (v14, 13.10.2026)

This is a draft of the steps only. Nothing here has been executed: no real or cloned member database was changed, and no account was used. After v14 is deployed, Ajay, or Codex at his direction, performs these steps in the browser.

**Superseded:** the earlier draft asked for a second reviewer and a mandatory birth place for Shagun. Both requirements were dropped on Ajay's explicit instruction at 12:24 IST.

## Confirmed facts (the source for the requests)

From Ajay's explicit statement on 13.10.2026, and Codex's check of `Vanshavali_Master_DB_2025-12-31.csv`:

| Person | CSV ID | Note |
|---|---|---|
| Ajay (अजय) | `गुगाहेड़ी_ii_38_8` | FatherID `गुगाहेड़ी_ii_37_3` |
| Father, Karambir (कर्मबीर) | `गुगाहेड़ी_ii_37_3` | |
| Brother, Akshay (अक्षय) | `गुगाहेड़ी_ii_38_7` | Same FatherID |
| Wife, Dr. Shagun Ajay Luhach | not in the archive | Needs a new spouse entry |

**Never select** `ज्ञानपुर_vii_38_10` (शगुन, Gyanpur). It is an unrelated person who only shares the name.

## Step 1 — Ajay confirms his own entry (original owner only)

Ajay's matching self claim was already submitted through the v12 UI and is pending. v14 recognises it, so **do not submit a new claim.**

1. Sign in on `test.luhachvansh.com` with the owner account and open the Home tab ("परिचय").
2. Find the card "वंशावली में आपकी प्रविष्टि". It has a panel titled "मूल मुख्य प्रशासक: अपनी प्रविष्टि की स्वयं पुष्टि" (original owner: confirm your own entry).
3. Check that the panel shows exactly:

   | Field | Expected value |
   |---|---|
   | Name | अजय |
   | Village | गुगाहेड़ी |
   | Record number (मूल क्रमांक) | `गुगाहेड़ी_ii_38_8` |
   | Recorded parent | कर्मबीर |

   **If anything differs, stop.**
4. Statement: "मैं अजय लुहाच, कर्मबीर (गुगाहेड़ी_ii_37_3) का पुत्र और अक्षय (गुगाहेड़ी_ii_38_7) का भाई हूँ; गुगाहेड़ी। यह मेरी अपनी प्रविष्टि है।"
5. Tick the confirmation box and press "अपनी प्रविष्टि की पुष्टि करें" (confirm my own entry).

**Result:** the claim is approved with method `owner_self_confirmation`, and the audit log records `owner_self_node_confirmed` with the statement. No other account is involved. Ordinary members still need a separate reviewer.

## Step 2 — Spouse proposal (Home → "पति/पत्नी, माता या बेटी जोड़ें")

| Field | Value |
|---|---|
| Relationship (रिश्ता) | पति / पत्नी |
| Life stage (जीवन की स्थिति) | वयस्क |
| "पहले से दर्ज व्यक्ति" picker | **Leave empty.** Do not pick the Gyanpur शगुन. |
| Full name (पूरा नाम) | डॉ. शगुन अजय लुहाच |
| Other name (अन्य नाम) | Dr. Shagun Ajay Luhach |
| Gender (लिंग) | महिला |
| Birth village / place (जन्म का गाँव / स्थान) | Tick **"स्थान ज्ञात नहीं — खाली रखें"** (place not known — leave blank) unless Ajay gives a real place. **Do not enter Gugaheri;** a husband's village is not her birth village. |
| Birth-family link and birth family (text) | Leave empty unless real details are known. |
| Marriage details | Optional. |
| Source type (स्रोत का प्रकार) | परिवार की प्रत्यक्ष जानकारी |
| Source details (स्रोत का विवरण) | "पति अजय लुहाच का स्पष्ट कथन, 13.10.2026।" |

**What happens next**
1. Once Step 1 is confirmed, the proposal shows "आपत्ति अवधि … तक" (objection window until …).
2. If nobody objects, it is accepted when the seven days end. If anyone objects, an administrator decides.
3. After acceptance:
   - Shagun has one private entry with a blank place and a permanent `LV-XXXX-XXXX` code, shown on Ajay's Requests tab.
   - Ajay sees her in "मेरा वंश-वृक्ष", labelled बहू.
   - She is not shown in the public tree.

## Step 3 — Optional: Shagun herself

If she ever wants to:
1. Ajay gives her the `LV-` code privately.
2. She creates her own invited account and enters the code in onboarding.
3. Her claim is reviewed.
4. She can then choose, with her own consent, to appear in the public tree. Contacts are never public.
