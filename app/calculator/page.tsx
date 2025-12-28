'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function CalculatorPage() {
  const [signType, setSignType] = useState('')
  const [size, setSize] = useState('')
  const [material, setMaterial] = useState('')
  const [illuminated, setIlluminated] = useState('')

  // Pricing data based on blog post content
  const calculatePrice = () => {
    if (!signType || !size || !material) {
      return null
    }

    let basePrice = 0
    let priceRange = { min: 0, max: 0 }

    // Base prices per square metre from blog data
    const materialPrices: Record<string, { min: number; max: number }> = {
      Foamex: { min: 8, max: 15 },
      Dibond: { min: 25, max: 45 },
      Aluminium: { min: 60, max: 95 },
      Acrylic: { min: 45, max: 85 },
    }

    // Size multipliers (approximate area in m²)
    const sizeMultipliers: Record<string, number> = {
      Small: 0.5, // <1m
      Medium: 1.5, // 1-2m
      Large: 3, // 2-4m
      'Extra Large': 6, // 4m+
    }

    // Sign type base prices (from blog post)
    if (signType === 'Flat Panel') {
      if (material === 'Foamex') {
        priceRange = { min: 150, max: 400 }
      } else if (material === 'Dibond') {
        priceRange = { min: 250, max: 600 }
      } else if (material === 'Aluminium') {
        priceRange = { min: 400, max: 900 }
      } else {
        // Acrylic or other
        const matPrice = materialPrices[material] || materialPrices.Dibond
        priceRange = {
          min: matPrice.min * sizeMultipliers[size],
          max: matPrice.max * sizeMultipliers[size],
        }
      }
    } else if (signType === 'Lightbox') {
      priceRange = { min: 600, max: 1200 }
      if (size === 'Large' || size === 'Extra Large') {
        priceRange = { min: 800, max: 1500 }
      }
    } else if (signType === 'Built-up Letters') {
      priceRange = { min: 1500, max: 4000 }
      if (size === 'Small') {
        priceRange = { min: 1200, max: 2500 }
      }
    } else if (signType === 'Tray Sign') {
      priceRange = { min: 1200, max: 3500 }
    } else if (signType === 'Vehicle Wrap') {
      priceRange = { min: 1500, max: 3500 }
    } else if (signType === 'Window Graphics') {
      priceRange = { min: 200, max: 800 }
      if (size === 'Large' || size === 'Extra Large') {
        priceRange = { min: 400, max: 1200 }
      }
    } else {
      // Default calculation based on material and size
      const matPrice = materialPrices[material] || materialPrices.Dibond
      priceRange = {
        min: matPrice.min * sizeMultipliers[size],
        max: matPrice.max * sizeMultipliers[size],
      }
    }

    // Add illumination cost
    if (illuminated === 'Yes') {
      priceRange.min += 300
      priceRange.max += 1500
    }

    return priceRange
  }

  const priceRange = calculatePrice()

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-6">
            Sign Cost Calculator
          </h1>
          <p className="text-xl text-blue-100">
            Get an instant estimate for your signage project. Prices are estimates only - always get formal quotes from local sign makers.
          </p>
        </div>
      </section>

      {/* Calculator form */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form className="space-y-6">
            {/* Sign Type */}
            <div>
              <label htmlFor="signType" className="block text-sm font-semibold text-gray-900 mb-2">
                Sign Type *
              </label>
              <select
                id="signType"
                value={signType}
                onChange={(e) => setSignType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="">Select sign type</option>
                <option value="Flat Panel">Flat Panel</option>
                <option value="Lightbox">Lightbox</option>
                <option value="Built-up Letters">Built-up Letters</option>
                <option value="Tray Sign">Tray Sign</option>
                <option value="Vehicle Wrap">Vehicle Wrap</option>
                <option value="Window Graphics">Window Graphics</option>
              </select>
            </div>

            {/* Size */}
            <div>
              <label htmlFor="size" className="block text-sm font-semibold text-gray-900 mb-2">
                Size *
              </label>
              <select
                id="size"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="">Select size</option>
                <option value="Small">Small (&lt;1m)</option>
                <option value="Medium">Medium (1-2m)</option>
                <option value="Large">Large (2-4m)</option>
                <option value="Extra Large">Extra Large (4m+)</option>
              </select>
            </div>

            {/* Material */}
            <div>
              <label htmlFor="material" className="block text-sm font-semibold text-gray-900 mb-2">
                Material *
              </label>
              <select
                id="material"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="">Select material</option>
                <option value="Foamex">Foamex</option>
                <option value="Dibond">Dibond</option>
                <option value="Aluminium">Aluminium</option>
                <option value="Acrylic">Acrylic</option>
              </select>
            </div>

            {/* Illuminated */}
            <div>
              <label htmlFor="illuminated" className="block text-sm font-semibold text-gray-900 mb-2">
                Illuminated?
              </label>
              <select
                id="illuminated"
                value={illuminated}
                onChange={(e) => setIlluminated(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="">Select option</option>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            {/* Price Display */}
            {priceRange && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Estimated Price Range</h3>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  £{priceRange.min.toLocaleString()} - £{priceRange.max.toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">
                  This is an estimate based on typical UK pricing. Actual costs may vary.
                </p>
              </div>
            )}

            {/* Get Quotes Button */}
            <div className="pt-4">
              <Link
                href="/"
                className="inline-block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors"
              >
                Get Quotes from Local Sign Makers
              </Link>
            </div>

            {/* Disclaimer */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 italic">
                * Estimates only. Prices are indicative and based on typical UK market rates as of December 2025. 
                Always get formal quotes from multiple reputable sign makers before making a decision. 
                Final costs will depend on specific requirements, location, installation complexity, and other factors.
              </p>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}

