# OVR Rating Update Guide

This guide explains how to add OVR (Overall Rating) values to all players in your database using the provided scripts.

## 🎯 **What We've Added**

### **Database Changes:**
- ✅ `account_id` column (INTEGER, default 1)
- ✅ `ovr_rating` column (INTEGER, nullable, 1-120 range)

### **Frontend Changes:**
- ✅ Updated Player type to include new fields
- ✅ Hidden delete buttons (commented out with TODO)
- ✅ Scripts for bulk OVR updates

---

## 📋 **Step-by-Step Instructions**

### **Step 1: Run Database Migration**

First, you need to add the new columns to your database:

```bash
cd backend
npx ts-node scripts/migrate-add-new-fields.ts
```

**What this does:**
- Adds `account_id` column with default value 1
- Adds `ovr_rating` column (nullable)
- Updates all existing players to have `account_id = 1`

**Expected output:**
```
✅ Database connected successfully
🔄 Running database migration...
Adding account_id column...
✅ account_id column added
Adding ovr_rating column...
✅ ovr_rating column added
Setting account_id = 1 for existing players...
✅ Updated 51 existing players to account_id = 1
🎉 Migration completed successfully!
```

---

### **Step 2: Generate Player Template**

Generate a template file showing all players with their IDs, names, and other details:

```bash
cd backend
npx ts-node scripts/generate-ovr-template.ts
```

**What this does:**
- Fetches all players from database
- Creates two template files:
  - `ovr-template.json` - JSON format
  - `ovr-template-excel.txt` - Excel-friendly tab-separated format

**Expected output:**
```
✅ Database connected successfully
Found 51 players
✅ JSON template saved to: scripts/ovr-template.json
✅ Excel template saved to: scripts/ovr-template-excel.txt

📋 INSTRUCTIONS:
1. Open ovr-template-excel.txt in Excel
2. Fill in the OVR Rating column (1-120)
3. Save as tab-separated text file
4. Run the bulk update script
```

---

### **Step 3: Fill in OVR Ratings**

**Option A: Using Excel (Recommended)**

1. Open `backend/scripts/ovr-template-excel.txt` in Excel
2. You'll see columns: ID, Name, Team, Position, Card Type, OVR Rating
3. Fill in the OVR Rating column for each player (1-120)
4. Save the file as `ovr-updates-excel.txt` in the same folder

**Option B: Using JSON**

1. Open `backend/scripts/ovr-template.json`
2. Fill in the `ovrRating` field for each player
3. Save as `ovr-updates.json` in the same folder

**Example JSON format:**
```json
[
  {
    "id": 1,
    "name": "lionel messi",
    "team": "barcelona",
    "position": "CF",
    "cardType": "epic-big time",
    "ovrRating": 93
  },
  {
    "id": 2,
    "name": "cristiano ronaldo",
    "team": "al nassr",
    "position": "CF",
    "cardType": "epic-big time",
    "ovrRating": 91
  }
]
```

---

### **Step 4: Run Bulk Update**

After filling in the OVR ratings, run the update script:

```bash
cd backend
npx ts-node scripts/bulk-update-ovr.ts
```

**What this does:**
- Reads your filled update file
- Validates OVR ratings (1-120 range)
- Shows preview of updates
- Updates database with confirmation

**Expected output:**
```
✅ Database connected successfully
📖 Reading JSON file...
✅ Found 51 player updates in JSON

🔍 Validating updates...
✅ 51 valid updates to apply

📋 Preview of updates:
   Player 1: OVR 93
   Player 2: OVR 91
   Player 3: OVR 89
   ... and 48 more

⚠️  This will update player OVR ratings in the database.
Type "yes" to continue, anything else to cancel:
```

Type `yes` to confirm the update.

**Final output:**
```
🔄 Updating database...
✅ Updated player 1 to OVR 93
✅ Updated player 2 to OVR 91
✅ Updated player 3 to OVR 89
...
🎉 Update complete!
✅ Successfully updated: 51 players
❌ Failed updates: 0 players
```

---

## 🔧 **For Non-Interactive Environments**

If you want to skip the confirmation prompt (useful for automated scripts):

```bash
AUTO_CONFIRM=true npx ts-node scripts/bulk-update-ovr.ts
```

---

## 📝 **Field Ranges & Validation**

### **OVR Rating:**
- **Range**: 1-120 (as requested)
- **Type**: INTEGER
- **Nullable**: Yes (can be empty initially)
- **Validation**: Scripts will reject values outside 1-120 range

### **Account ID:**
- **Range**: 1, 2, 3, etc. (positive integers)
- **Type**: INTEGER
- **Default**: 1 (all existing players)
- **Nullable**: No (every player must have an account)

---

## 🚨 **Troubleshooting**

### **Error: "duplicate column" or "already exists"**
- **Meaning**: Columns already exist in database
- **Solution**: Migration already ran, no action needed
- **Continue**: Go to Step 2

### **Error: "Invalid OVR rating"**
- **Meaning**: Rating is outside 1-120 range
- **Solution**: Check your data and fix invalid ratings
- **Example**: Rating of 150 will be rejected

### **Error: "No update file found"**
- **Meaning**: Neither JSON nor Excel update file exists
- **Solution**: Create either `ovr-updates.json` or `ovr-updates-excel.txt`

### **Error: "Player X not found"**
- **Meaning**: Player ID in update file doesn't exist in database
- **Solution**: Check player IDs match current database

---

## 🎯 **What You'll Get After Completion**

### **Database:**
- ✅ All players have `account_id = 1`
- ✅ All players have their OVR ratings filled in
- ✅ New fields properly integrated

### **Frontend:**
- ✅ Player data includes new fields
- ✅ Ready for account filtering (future implementation)
- ✅ Ready for OVR display (future implementation)
- ✅ Delete buttons hidden (can be re-enabled later)

---

## 🔄 **Future Updates**

### **If you need to update OVR ratings again:**
1. Run `generate-ovr-template.ts` to get current player list
2. Fill in new OVR values
3. Run `bulk-update-ovr.ts` to update database

### **If you need to change account assignments:**
- This will require additional scripts or admin interface
- Currently, all players are on account 1

### **If you want to re-enable delete buttons:**
- Uncomment the delete button code in `app/players/page.tsx`
- Remove TODO comments
- Ensure account system is stable first

---

## 📊 **File Locations**

All scripts are located in: `backend/scripts/`

- `migrate-add-new-fields.ts` - Database migration
- `generate-ovr-template.ts` - Template generator
- `bulk-update-ovr.ts` - Bulk update script

Generated files will be in the same folder:
- `ovr-template.json` - Template for manual editing
- `ovr-template-excel.txt` - Excel-friendly template
- `ovr-updates.json` - Your filled JSON updates
- `ovr-updates-excel.txt` - Your filled Excel updates

---

## ✅ **Checklist**

- [ ] Run database migration script
- [ ] Generate player template
- [ ] Fill in OVR ratings for all players
- [ ] Run bulk update script
- [ ] Verify OVR ratings appear in database
- [ ] Test frontend displays new fields

---

## 🎉 **Success Criteria**

You'll know everything worked when:
1. Database has both new columns
2. All 51+ players have OVR ratings filled in
3. No errors during the bulk update process
4. Frontend can access the new fields (check API response)

Good luck with your OVR data entry! 🚀