import React, { useState, useEffect } from 'react';
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./components/ui/table";
import { Badge } from "./components/ui/badge";
import { Users, Package, TrendingUp, User, Shield, DollarSign, AlertTriangle, Lock, Key, Phone } from "lucide-react";

// Type definitions
const StockManagementSystem = () => {
  // Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [pinInput, setPinInput] = useState("");
  const [showPinChange, setShowPinChange] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [masterPin, setMasterPin] = useState("");
  
  // Forgot PIN states
  const [showForgotPin, setShowForgotPin] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [resetPin, setResetPin] = useState("");
  const [confirmResetPin, setConfirmResetPin] = useState("");
  
  // Users data
  const [users, setUsers] = useState([
    { id: "1", name: "Admin", role: "admin", pin: "0000", phoneNumber: "+254793295545" },
    { id: "2", name: "Stock Keeper", role: "stock-keeper", pin: "1111", phoneNumber: "+254793295545" },
    { id: "3", name: "Chef", role: "chef", pin: "2222", phoneNumber: "+254793295545" },
    { id: "4", name: "Barista", role: "barista", pin: "3333", phoneNumber: "+254793295545" }
  ]);
  
  // Stock management states
  const [stockItems, setStockItems] = useState([]);
  const [stockOutRecords, setStockOutRecords] = useState([]);
  const [stockUsageRecords, setStockUsageRecords] = useState([]);
  
  // Form states
  const [stockInForm, setStockInForm] = useState({
    name: '',
    size: '',
    quantity: '',
    supplier: '',
    cost: '',
    minStock: '5'
  });
  
  const [stockOutForm, setStockOutForm] = useState({
    stockId: '',
    quantity: '',
    taker: '',
    destination: 'kitchen'
  });
  
  const [usageForm, setUsageForm] = useState({
    stockId: '',
    quantityTaken: '',
    quantityUsed: '',
    quantityRemaining: ''
  });
  
  // Handle PIN login
  const handleLogin = () => {
    if (pinInput.length !== 4) {
      alert("PIN must be 4 digits");
      return;
    }
    
    const user = users.find(u => u.pin === pinInput);
    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
      setPinInput("");
    } else {
      alert("Invalid PIN");
    }
  };
  
  // Handle PIN change
  const handleChangePin = () => {
    if (newPin.length !== 4 || confirmPin.length !== 4) {
      alert("PINs must be 4 digits");
      return;
    }
    
    if (newPin !== confirmPin) {
      alert("New PINs do not match");
      return;
    }
    
    if (currentUser) {
      // For admin changing master PIN
      if (masterPin === "0000" && currentUser.role === "admin") {
        const updatedUsers = users.map(user => 
          user.role === "admin" ? { ...user, pin: newPin } : user
        );
        setUsers(updatedUsers);
        alert("Master PIN changed successfully");
      } 
      // For regular users changing their own PIN
      else if (masterPin === users.find(u => u.role === "admin")?.pin) {
        const updatedUsers = users.map(user => 
          user.id === currentUser.id ? { ...user, pin: newPin } : user
        );
        setUsers(updatedUsers);
        setCurrentUser({ ...currentUser, pin: newPin });
        alert("PIN changed successfully");
      } else {
        alert("Invalid master PIN");
        return;
      }
      
      setNewPin("");
      setConfirmPin("");
      setMasterPin("");
      setShowPinChange(false);
    }
  };
  
  // Handle forgot PIN - send OTP
  const handleSendOtp = () => {
    alert(`OTP sent to ${users[0].phoneNumber}. For demo purposes, the OTP is 1234.`);
    setOtpSent(true);
  };
  
  // Handle OTP verification and PIN reset
  const handleResetPin = () => {
    if (otpInput !== "1234") {
      alert("Invalid OTP");
      return;
    }
    
    if (resetPin.length !== 4 || confirmResetPin.length !== 4) {
      alert("PINs must be 4 digits");
      return;
    }
    
    if (resetPin !== confirmResetPin) {
      alert("PINs do not match");
      return;
    }
    
    const updatedUsers = [...users];
    updatedUsers[0] = { ...updatedUsers[0], pin: resetPin };
    setUsers(updatedUsers);
    
    alert("PIN reset successfully");
    setShowForgotPin(false);
    setOtpSent(false);
    setOtpInput("");
    setResetPin("");
    setConfirmResetPin("");
  };
  
  // Handle stock in form submission
  const handleStockInSubmit = (e) => {
    e.preventDefault();
    
    if (!stockInForm.name || !stockInForm.size || !stockInForm.quantity || 
        !stockInForm.supplier || !stockInForm.cost || !stockInForm.minStock) return;
    
    const quantity = parseInt(stockInForm.quantity);
    const cost = parseFloat(stockInForm.cost);
    const minStock = parseInt(stockInForm.minStock);
    
    if (isNaN(quantity) || quantity <= 0 || isNaN(cost) || cost < 0 || isNaN(minStock) || minStock < 0) return;
    
    const existingStockIndex = stockItems.findIndex(
      item => item.name === stockInForm.name && item.size === stockInForm.size
    );
    
    if (existingStockIndex >= 0) {
      const updatedStockItems = [...stockItems];
      const existingItem = updatedStockItems[existingStockIndex];
      
      const totalQuantity = existingItem.quantity + quantity;
      const totalCost = (existingItem.quantity * existingItem.cost) + (quantity * cost);
      const newAverageCost = totalCost / totalQuantity;
      
      updatedStockItems[existingStockIndex] = {
        ...existingItem,
        quantity: totalQuantity,
        cost: parseFloat(newAverageCost.toFixed(2)),
        supplier: stockInForm.supplier,
        minStock,
        lastUpdated: new Date().toISOString()
      };
      setStockItems(updatedStockItems);
    } else {
      const newStockItem = {
        id: Date.now().toString(),
        name: stockInForm.name,
        size: stockInForm.size,
        quantity: quantity,
        supplier: stockInForm.supplier,
        cost: cost,
        minStock,
        lastUpdated: new Date().toISOString()
      };
      setStockItems([...stockItems, newStockItem]);
    }
    
    setStockInForm({
      name: '',
      size: '',
      quantity: '',
      supplier: '',
      cost: '',
      minStock: '5'
    });
  };
  
  // Handle stock out form submission
  const handleStockOutSubmit = (e) => {
    e.preventDefault();
    
    if (!stockOutForm.stockId || !stockOutForm.quantity || !stockOutForm.taker) return;
    
    const quantity = parseInt(stockOutForm.quantity);
    if (isNaN(quantity) || quantity <= 0) return;
    
    const stockItem = stockItems.find(item => item.id === stockOutForm.stockId);
    if (!stockItem || stockItem.quantity < quantity) {
      alert('Insufficient stock quantity');
      return;
    }
    
    const updatedStockItems = stockItems.map(item => 
      item.id === stockOutForm.stockId 
        ? { ...item, quantity: item.quantity - quantity, lastUpdated: new Date().toISOString() } 
        : item
    );
    setStockItems(updatedStockItems);
    
    const newStockOutRecord = {
      id: Date.now().toString(),
      stockId: stockOutForm.stockId,
      stockName: stockItem.name,
      size: stockItem.size,
      quantity: quantity,
      taker: stockOutForm.taker,
      destination: stockOutForm.destination,
      timestamp: new Date().toISOString()
    };
    setStockOutRecords([newStockOutRecord, ...stockOutRecords]);
    
    setStockOutForm({
      stockId: '',
      quantity: '',
      taker: '',
      destination: 'kitchen'
    });
  };
  
  // Handle usage form submission
  const handleUsageSubmit = (e) => {
    e.preventDefault();
    
    if (!usageForm.stockId || !usageForm.quantityTaken || !usageForm.quantityUsed) return;
    
    const quantityTaken = parseInt(usageForm.quantityTaken);
    const quantityUsed = parseInt(usageForm.quantityUsed);
    const quantityRemaining = parseInt(usageForm.quantityRemaining);
    
    if (isNaN(quantityTaken) || isNaN(quantityUsed) || isNaN(quantityRemaining)) return;
    if (quantityTaken <= 0 || quantityUsed <= 0 || quantityRemaining < 0) return;
    
    const stockItem = stockItems.find(item => item.id === usageForm.stockId);
    if (!stockItem) return;
    
    const newUsageRecord = {
      id: Date.now().toString(),
      stockId: usageForm.stockId,
      stockName: stockItem.name,
      size: stockItem.size,
      quantityTaken,
      quantityUsed,
      quantityRemaining,
      loggedBy: currentUser?.name || "Unknown User",
      timestamp: new Date().toISOString()
    };
    setStockUsageRecords([newUsageRecord, ...stockUsageRecords]);
    
    setUsageForm({
      stockId: '',
      quantityTaken: '',
      quantityUsed: '',
      quantityRemaining: ''
    });
  };
  
  // Handle stock selection for usage form
  const handleStockSelection = (stockId) => {
    setUsageForm({
      ...usageForm,
      stockId
    });
    
    const stockItem = stockItems.find(item => item.id === stockId);
    if (stockItem) {
      setUsageForm(prev => ({
        ...prev,
        quantityTaken: stockItem.quantity.toString()
      }));
    }
  };
  
  // Calculate remaining quantity when taken/used changes
  useEffect(() => {
    const taken = parseInt(usageForm.quantityTaken) || 0;
    const used = parseInt(usageForm.quantityUsed) || 0;
    const remaining = taken - used;
    
    if (remaining >= 0) {
      setUsageForm(prev => ({
        ...prev,
        quantityRemaining: remaining.toString()
      }));
    }
  }, [usageForm.quantityTaken, usageForm.quantityUsed]);
  
  // Check if stock is below minimum level
  const isStockLow = (item) => {
    return item.quantity <= item.minStock;
  };
  
  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setPinInput("");
  };
  
  // Login screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Lock className="h-6 w-6" />
              Stock Management System
            </CardTitle>
            <p className="text-gray-600">Enter your 4-digit PIN to access</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pin">4-Digit PIN</Label>
              <Input
                id="pin"
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter PIN"
                className="text-center text-2xl tracking-widest"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <Button onClick={handleLogin} className="w-full">Login</Button>
            
            <div className="pt-4 text-center">
              <Button 
                variant="link" 
                className="text-sm"
                onClick={() => {
                  setShowPinChange(!showPinChange);
                  setShowForgotPin(false);
                }}
              >
                Change PIN
              </Button>
              
              <Button 
                variant="link" 
                className="text-sm ml-4"
                onClick={() => {
                  setShowForgotPin(!showForgotPin);
                  setShowPinChange(false);
                }}
              >
                Forgot PIN?
              </Button>
            </div>
            
            {showPinChange && (
              <Card className="mt-4">
                <CardContent className="pt-4 space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="newPin">New PIN</Label>
                    <Input
                      id="newPin"
                      type="password"
                      maxLength={4}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="New 4-digit PIN"
                      className="text-center"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPin">Confirm New PIN</Label>
                    <Input
                      id="confirmPin"
                      type="password"
                      maxLength={4}
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="Confirm new PIN"
                      className="text-center"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="masterPin">Master PIN</Label>
                    <Input
                      id="masterPin"
                      type="password"
                      maxLength={4}
                      value={masterPin}
                      onChange={(e) => setMasterPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="Admin PIN"
                      className="text-center"
                    />
                  </div>
                  
                  <Button onClick={handleChangePin} className="w-full">Change PIN</Button>
                </CardContent>
              </Card>
            )}
            
            {showForgotPin && (
              <Card className="mt-4">
                <CardContent className="pt-4 space-y-3">
                  {!otpSent ? (
                    <>
                      <p className="text-sm text-gray-600 text-center">
                        An OTP will be sent to the registered phone number
                      </p>
                      <div className="flex items-center justify-center gap-2 py-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{users[0].phoneNumber}</span>
                      </div>
                      <Button onClick={handleSendOtp} className="w-full">
                        Send OTP
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="otp">Enter OTP</Label>
                        <Input
                          id="otp"
                          type="text"
                          maxLength={4}
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                          placeholder="Enter 4-digit OTP"
                          className="text-center"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="resetPin">New PIN</Label>
                        <Input
                          id="resetPin"
                          type="password"
                          maxLength={4}
                          value={resetPin}
                          onChange={(e) => setResetPin(e.target.value.replace(/\D/g, ''))}
                          placeholder="New 4-digit PIN"
                          className="text-center"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirmResetPin">Confirm New PIN</Label>
                        <Input
                          id="confirmResetPin"
                          type="password"
                          maxLength={4}
                          value={confirmResetPin}
                          onChange={(e) => setConfirmResetPin(e.target.value.replace(/\D/g, ''))}
                          placeholder="Confirm new PIN"
                          className="text-center"
                        />
                      </div>
                      
                      <Button onClick={handleResetPin} className="w-full">
                        Reset PIN
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full mt-2"
                        onClick={() => {
                          setOtpSent(false);
                          setOtpInput("");
                        }}
                      >
                        Resend OTP
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main application
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Stock Management System</h1>
              <p className="text-gray-600">Manage inventory and track usage efficiently</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-gray-600" />
                <span className="font-medium">
                  {currentUser?.name} ({currentUser?.role})
                </span>
              </div>
              
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Stock Management */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stock In Form */}
            {(currentUser?.role === 'admin' || currentUser?.role === 'stock-keeper') && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Add Stock (Stock In)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleStockInSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="stockName">Stock Name</Label>
                        <Input
                          id="stockName"
                          value={stockInForm.name}
                          onChange={(e) => setStockInForm({...stockInForm, name: e.target.value})}
                          placeholder="e.g. Flour"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="stockSize">Size</Label>
                        <Input
                          id="stockSize"
                          value={stockInForm.size}
                          onChange={(e) => setStockInForm({...stockInForm, size: e.target.value})}
                          placeholder="e.g. 1kg"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="stockQuantity">Quantity</Label>
                        <Input
                          id="stockQuantity"
                          type="number"
                          min="1"
                          value={stockInForm.quantity}
                          onChange={(e) => setStockInForm({...stockInForm, quantity: e.target.value})}
                          placeholder="e.g. 10"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="stockSupplier">Supplier</Label>
                        <Input
                          id="stockSupplier"
                          value={stockInForm.supplier}
                          onChange={(e) => setStockInForm({...stockInForm, supplier: e.target.value})}
                          placeholder="e.g. ABC Supplies"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="stockCost">Cost (Total)</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="stockCost"
                            type="number"
                            min="0"
                            step="0.01"
                            value={stockInForm.cost}
                            onChange={(e) => setStockInForm({...stockInForm, cost: e.target.value})}
                            placeholder="e.g. 25.99"
                            className="pl-8"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="minStock">Min Stock Level</Label>
                        <Input
                          id="minStock"
                          type="number"
                          min="0"
                          value={stockInForm.minStock}
                          onChange={(e) => setStockInForm({...stockInForm, minStock: e.target.value})}
                          placeholder="e.g. 5"
                          required
                        />
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full">Add Stock</Button>
                  </form>
                </CardContent>
              </Card>
            )}
            
            {/* Stock Out Form */}
            {(currentUser?.role === 'admin' || currentUser?.role === 'stock-keeper') && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Remove Stock (Stock Out)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleStockOutSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="stockSelect">Select Stock</Label>
                        <Select 
                          value={stockOutForm.stockId} 
                          onValueChange={(value) => setStockOutForm({...stockOutForm, stockId: value})}
                        >
                          <SelectTrigger id="stockSelect">
                            <SelectValue placeholder="Select stock item" />
                          </SelectTrigger>
                          <SelectContent>
                            {stockItems.map(item => (
                              <SelectItem 
                                key={item.id} 
                                value={item.id}
                              >
                                {item.name} ({item.size}) - {item.quantity} units
                                {isStockLow(item) && (
                                  <span className="ml-2 text-red-500">
                                    <AlertTriangle className="inline h-4 w-4" />
                                  </span>
                                )}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="quantityOut">Quantity</Label>
                        <Input
                          id="quantityOut"
                          type="number"
                          min="1"
                          value={stockOutForm.quantity}
                          onChange={(e) => setStockOutForm({...stockOutForm, quantity: e.target.value})}
                          placeholder="e.g. 5"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="taker">Taker Name</Label>
                        <Input
                          id="taker"
                          value={stockOutForm.taker}
                          onChange={(e) => setStockOutForm({...stockOutForm, taker: e.target.value})}
