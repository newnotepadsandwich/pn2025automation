# 🎯 Auto Battle V3.8 - Ultimate Multi-Mode Script

## 🏆 **THE COMPLETE AUTOMATION POWERHOUSE**

Auto Battle V3.8 is the most comprehensive Pockie Ninja automation script ever created, featuring **8 distinct automation modes** with intelligent health management and failsafe systems designed for **safe overnight farming**.

---

## 🧩 **CORE AUTOMATION MODES**

### 1. 🎰 **Slot Machine (SM) Automation**
- **Auto-Spin Intelligence**: Automatically clicks slot machine icon with perfect timing
- **Smart Challenge System**: Auto-detects and clicks "Challenge" → "Fight" sequence  
- **Result Detection**: Automatically closes result modals and handles rewards
- **Cooldown Awareness**: Detects red cooldown divs and waits appropriately

### 2. 🏯 **Las Noches (LN) Floor Automation**
- **Target Floor System**: Set your desired floor and let it auto-advance
- **Smart Navigation**: Uses "Next" button with intelligent timing
- **Auto-Combat**: Fights available enemies during floor progression
- **Completion Detection**: Automatically stops when target floor is reached

### 3. 🕍 **Valhalla (VH) Group Management** 
- **4-Tier Logic**: Handles complex group selection across multiple tiers
- **Sequential Targeting**: Auto-selects available groups and enemies in order
- **Fight Detection**: Instantly clicks "Fight" when it becomes available
- **Continuous Looping**: Seamlessly cycles through multiple levels

### 4. 😈 **Demon Beast (DB) NPC Cycling**
- **Pre-Defined NPC List**: Loops through 9 optimized NPC targets
- **Challenge Automation**: Auto-clicks "Challenge" → "Fight" sequence
- **Result Handling**: Closes modals and proceeds to next NPC
- **Canvas Integration**: Smart canvas clicking for NPC selection

---

## ❤️‍🩹 **SMART HEALTH MONITORING SYSTEM**

### **Multi-Tier Health Detection:**

1. **🎯 Icon Title Method (Most Reliable)**
   - Reads HP/MP directly from icon titles (e.g., "HP: 60000/65000")
   - Instant, accurate percentage calculations

2. **📊 Carrier Bag Capacity (Fallback)**
   - Analyzes capacity patterns like "64442/65000"
   - Position-based detection (first = HP, second = MP)

3. **📱 UI Element Scanning (Legacy)**
   - Searches health bars and text elements
   - Compatible with different UI configurations

### **🛡️ Safety Thresholds:**
- **HP Minimum**: 30% (configurable)
- **MP Minimum**: 20% (configurable)  
- **Auto-Purchase Trigger**: 50% for both HP/MP
- **Full Health**: 90%+ considered "full"

---

## 🛒 **AUTO-PURCHASE SYSTEM**

### **Carrier Bag Automation:**
- **Smart UI Detection**: Finds Carrier Bag panel at any position
- **Dropdown Management**: Selects optimal purchase amounts (5K-65K)
- **Buy Button Logic**: Checks if buttons are enabled before clicking
- **Confirmation Handling**: Auto-clicks "Accept" in purchase dialogs

### **🕒 Safe Purchase Intervals:**
- **2-Minute Cooldown**: Prevents rapid-fire purchases
- **Overnight Safe**: Designed for AFK/overnight farming
- **Purchase Tracking**: Logs all transactions with timestamps

### **💰 Intelligent Amount Selection:**
- Tries exact configured amount first
- Falls back to largest available option
- Validates all amounts are > 0
- Handles "bag full" scenarios gracefully

---

## 🧠 **ADVANCED FAILSAFE LOGIC**

### **🚨 Safety Detections:**
- **Modal Detection**: Identifies open dialogs and result screens
- **Button State**: Checks if buttons are disabled/unavailable  
- **Cooldown Recognition**: Detects red cooldown indicators
- **Health Validation**: Ensures safe HP/MP before actions

### **⚠️ Error Recovery:**
- **Timeout Handling**: Prevents infinite waits
- **Element Not Found**: Graceful fallbacks when UI elements missing
- **Purchase Failures**: Retry logic with exponential backoff
- **Modal Stuck**: ESC key fallback for stuck dialogs

---

## 🧾 **REAL-TIME STATUS SYSTEM**

### **📊 Always-Visible Status Panel:**
```
🕒 14:23:45
SM: Fighting ⚔️

Health: HP 85.2% MP 72.1%
Auto-Buy: 10k (✅ Enabled)
```

### **📝 Comprehensive Logging:**
- **Action Timestamps**: Every action logged with precise time
- **Health Updates**: Real-time HP/MP percentage display
- **Mode Indicators**: Clear status for each automation mode  
- **Purchase Logs**: Detailed transaction history
- **Error Reporting**: Clear error messages with context

---

## ⚙️ **CONFIGURATION PANEL**

### **🎛️ Health Management Settings:**
- **Min HP Threshold**: 0-100% slider
- **Min MP Threshold**: 0-100% slider  
- **Auto-Buy Toggle**: Enable/disable purchase system
- **Purchase Amount**: Dropdown (5K, 10K, 20K, 30K, 40K, 50K, 60K, 65K)

### **🔧 Dynamic Updates:**
- **Live Configuration**: Changes apply immediately
- **Visual Feedback**: Color-coded status indicators
- **Mode Labels**: Update based on current settings

---

## 🌙 **PERFECT FOR OVERNIGHT FARMING**

### **Why V3.8 is Ideal for AFK:**
1. **🛡️ Conservative Cooldowns**: 2-minute purchase intervals
2. **❤️‍🩹 Health Safety**: Never fights with low HP/MP
3. **🔄 Smart Retries**: Handles temporary UI glitches
4. **📊 Status Logging**: Track progress while away
5. **💤 Memory Efficient**: Minimal resource usage
6. **🚨 Error Recovery**: Automatic problem resolution

---

## 🎮 **USAGE SCENARIOS**

### **Slot Machine Farming:**
```javascript
✅ Enable Auto-Buy (10K)
✅ Set HP: 30%, MP: 20%
✅ Click "Start SM"
✅ Go AFK for hours!
```

### **Las Noches Progression:**
```javascript
✅ Set target floor (e.g., "50")
✅ Enable health monitoring
✅ Click "Start LN"  
✅ Script stops at target floor
```

### **Multi-Mode Setup:**
```javascript
✅ Test health detection first
✅ Configure purchase amounts
✅ Start desired mode(s)
✅ Monitor via status panel
```

---

## 🏆 **TECHNICAL EXCELLENCE**

- **🔬 Precision Selectors**: Uses exact DOM paths for reliability
- **⚡ Optimized Performance**: Efficient element detection
- **🛡️ XSS Protection**: All user inputs sanitized  
- **📱 Mobile Compatible**: Works on all screen sizes
- **🔄 Event Handling**: Proper mouse event simulation
- **💾 Memory Management**: Clean interval cleanup

---

**Auto Battle V3.8** represents the pinnacle of Pockie Ninja automation - combining multiple game modes, intelligent health management, and rock-solid reliability into one comprehensive script that truly understands the game's mechanics and player needs.

**Perfect for players who want to maximize their progress while maintaining account safety through intelligent automation.**
