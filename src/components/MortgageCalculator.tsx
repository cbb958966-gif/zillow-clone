'use client';

import { useState, useEffect } from 'react';

interface MortgageCalculatorProps {
  propertyPrice: number;
}

export default function MortgageCalculator({ propertyPrice }: MortgageCalculatorProps) {
  const [formData, setFormData] = useState({
    downPayment: '20',
    interestRate: '6.5',
    loanTerm: '30',
    propertyTax: '1.2',
    insurance: '0.5'
  });

  const [results, setResults] = useState({
    monthlyPayment: 0,
    principalAndInterest: 0,
    propertyTaxMonthly: 0,
    insuranceMonthly: 0,
    totalInterest: 0,
    totalPayment: 0
  });

  useEffect(() => {
    calculateMortgage();
  }, [formData, propertyPrice]);

  const calculateMortgage = () => {
    const price = propertyPrice;
    const downPaymentPercent = parseFloat(formData.downPayment) / 100;
    const downPaymentAmount = price * downPaymentPercent;
    const loanAmount = price - downPaymentAmount;
    const monthlyRate = parseFloat(formData.interestRate) / 100 / 12;
    const numPayments = parseFloat(formData.loanTerm) * 12;

    if (monthlyRate === 0 || numPayments === 0) {
      setResults({
        monthlyPayment: 0,
        principalAndInterest: 0,
        propertyTaxMonthly: 0,
        insuranceMonthly: 0,
        totalInterest: 0,
        totalPayment: 0
      });
      return;
    }

    // Calculate principal and interest using mortgage formula
    const principalAndInterest = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
      (Math.pow(1 + monthlyRate, numPayments) - 1);

    const propertyTaxMonthly = (price * parseFloat(formData.propertyTax) / 100) / 12;
    const insuranceMonthly = (price * parseFloat(formData.insurance) / 100) / 12;
    const monthlyPayment = principalAndInterest + propertyTaxMonthly + insuranceMonthly;
    const totalPayment = monthlyPayment * numPayments + downPaymentAmount;
    const totalInterest = totalPayment - price;

    setResults({
      monthlyPayment,
      principalAndInterest,
      propertyTaxMonthly,
      insuranceMonthly,
      totalInterest,
      totalPayment
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Mortgage Calculator</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Down Payment (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={formData.downPayment}
            onChange={(e) => handleChange('downPayment', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            {formatCurrency(propertyPrice * parseFloat(formData.downPayment) / 100)}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Interest Rate (%)
          </label>
          <input
            type="number"
            min="0"
            max="20"
            step="0.1"
            value={formData.interestRate}
            onChange={(e) => handleChange('interestRate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Loan Term (years)
          </label>
          <select
            value={formData.loanTerm}
            onChange={(e) => handleChange('loanTerm', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="15">15 years</option>
            <option value="20">20 years</option>
            <option value="25">25 years</option>
            <option value="30">30 years</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Annual Property Tax (%)
          </label>
          <input
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={formData.propertyTax}
            onChange={(e) => handleChange('propertyTax', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Results */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Monthly Payment:</span>
          <span className="text-2xl font-bold text-blue-600">
            {formatCurrency(results.monthlyPayment)}
          </span>
        </div>

        <div className="border-t pt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Principal & Interest:</span>
            <span>{formatCurrency(results.principalAndInterest)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Property Tax:</span>
            <span>{formatCurrency(results.propertyTaxMonthly)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Insurance:</span>
            <span>{formatCurrency(results.insuranceMonthly)}</span>
          </div>
        </div>

        <div className="border-t pt-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total of {formData.loanTerm} payments:</span>
            <span>{formatCurrency(results.monthlyPayment * parseFloat(formData.loanTerm) * 12)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Interest:</span>
            <span>{formatCurrency(results.totalInterest)}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        This is an estimate. Actual payments may vary based on lender requirements, HOA fees, and other factors.
      </div>
    </div>
  );
}