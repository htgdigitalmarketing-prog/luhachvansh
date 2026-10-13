# Draft: Ajay's own node claim and Dr. Shagun's spouse proposal (13.10.2026)

This is a draft of the steps only. Nothing here has been executed: no real or cloned member database was changed, and no account was used. Ajay performs these steps himself in the browser after the v13 source is deployed to the test site. Codex verifies. The independent-review rules still apply.

## Confirmed facts (the source for the requests)

From Ajay's explicit statement to Codex on 13.10.2026, and the Codex check of `Vanshavali_Master_DB_2025-12-31.csv`:

| Person | CSV ID | Note |
|---|---|---|
| Ajay (अजय) | `गुगाहेड़ी_ii_38_8` | FatherID `गुगाहेड़ी_ii_37_3` |
| Father, Karambir (कर्मबीर) | `गुगाहेड़ी_ii_37_3` | |
| Brother, Akshay (अक्षय) | `गुगाहेड़ी_ii_38_7` | Same FatherID |
| Wife, Dr. Shagun Ajay Luhach | not in the archive | Needs a new spouse entry |

**Do not select** `ज्ञानपुर_vii_38_10` (शगुन, Gyanpur). It is an unrelated person who only shares the name.

The app imports archive rows with `legacy_id` set to the CSV ID, and the onboarding card shows it as "मूल क्रमांक". Before choosing, check that the card shows exactly `गुगाहेड़ी_ii_38_8`. Copy the ID from the CSV itself, because the Unicode form, including the nukta in ड़, must match.

## Step 1 — Ajay links his account (mandatory onboarding)

1. Sign in on the test site. Because the domain changed, the old session cookie is not valid there.
2. The "वंशावली से जुड़ें" step appears automatically. Ajay's owner account is still unlinked, so it is required.
3. Enter these search terms:

   | Field | Value |
   |---|---|
   | Name | अजय |
   | Village | गुगाहेड़ी |
   | Father or mother | कर्मबीर |

4. Choose only the card that shows all of these:
   - record number `गुगाहेड़ी_ii_38_8`
   - parent: कर्मबीर
   - the expected generation
5. In "समीक्षक इसकी जाँच कैसे करें?", enter: "मैं कर्मबीर (गुगाहेड़ी_ii_37_3) का पुत्र और अक्षय (गुगाहेड़ी_ii_38_7) का भाई हूँ; गुगाहेड़ी। समीक्षक परिवार से पुष्टि कर सकते हैं।"
6. Tick the confirmation box and send.

**Result:** the claim stays pending. Ajay cannot approve it himself, and the system rejects any attempt. A separately appointed, verified relative (the second reviewer) must check it and approve it.

## Step 2 — Spouse proposal (from Ajay's home page, "पति/पत्नी, माता या बेटी जोड़ें")

Fill in the form as follows:

| Field | Value |
|---|---|
| Relationship (रिश्ता) | पति / पत्नी |
| Life stage (जीवन की स्थिति) | वयस्क |
| "पहले से दर्ज व्यक्ति" picker | **Leave empty.** Do not pick the Gyanpur शगुन. |
| Full name (पूरा नाम) | डॉ. शगुन अजय लुहाच |
| Other name (अन्य नाम) | Dr. Shagun Ajay Luhach |
| Gender (लिंग) | महिला |
| Birth village / place (जन्म का गाँव / स्थान) | **Human input needed:** her own birth village or town. This field is required for a new entry. If she prefers not to give it, use the current family place she agrees to show to verified relatives. |
| Birth-family link | Leave empty unless her father or mother is already in the archive. |
| Birth family (text) | Optional: her father's or mother's name and village, if she agrees. |
| Marriage details (विवाह का विवरण) | Optional: year or place. |
| Source type (स्रोत का प्रकार) | परिवार की प्रत्यक्ष जानकारी |
| Source details (स्रोत का विवरण) | "पति अजय लुहाच का स्पष्ट कथन, 13.10.2026।" |

**What happens next:**
1. **While Ajay's identity claim is pending:** the proposal shows "प्रस्तावक की पहचान की पुष्टि की प्रतीक्षा". It cannot be accepted, either automatically or by an administrator.
2. **When the second reviewer approves Ajay's claim:** a full seven-day objection window starts.
3. **At the end of the window:** if there is no objection or conflict, the proposal is accepted automatically. If anyone objects, an administrator decides.
4. **After acceptance:**
   - Shagun has one private entry with a permanent code like `LV-XXXX-XXXX`, shown on Ajay's Requests tab.
   - Ajay sees her in "मेरा वंश-वृक्ष", coloured and labelled as बहू.
   - The public tree does not show her.

## Step 3 — Optional: Shagun publishes herself, by her own consent

1. Ajay gives Shagun her `LV-` code privately.
2. Shagun creates her own account with an invitation.
3. In onboarding she enters the code in "परिवार से मिला कोड" and claims her entry. An administrator verifies the claim.
4. Under गोपनीयता, she may choose "सार्वजनिक वंशावली भी" and tick the consent box.
5. Only then do her name, village and marriage link appear in the public tree and in Mitra. Contacts are never public, and she can withdraw at any time.

## Still needed from people (not from code)

- Ajay chooses and appoints the real second reviewer.
- Ajay supplies Shagun's birth village or place, or the place she agrees to show.
- Shagun decides for herself whether to appear publicly.
