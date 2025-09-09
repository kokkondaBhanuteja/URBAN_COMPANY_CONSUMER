"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import { getStorageItem, setStorageItem } from "./storage"

export interface CartItem {
  serviceId: string
  optionId: string
  title: string
  optionTitle: string
  qty: number
  unitPriceSubunits: number
  currency: "INR"
  image?: string
}

interface CartState {
  items: CartItem[]
  totalItems: number
  totalAmountSubunits: number
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "qty"> }
  | { type: "REMOVE_ITEM"; payload: { serviceId: string; optionId: string } }
  | { type: "UPDATE_QUANTITY"; payload: { serviceId: string; optionId: string; qty: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] }

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItemIndex = state.items.findIndex(
        (item) => item.serviceId === action.payload.serviceId && item.optionId === action.payload.optionId,
      )

      let newItems: CartItem[]
      if (existingItemIndex >= 0) {
        newItems = state.items.map((item, index) =>
          index === existingItemIndex ? { ...item, qty: item.qty + 1 } : item,
        )
      } else {
        newItems = [...state.items, { ...action.payload, qty: 1 }]
      }

      return {
        items: newItems,
        totalItems: newItems.reduce((sum, item) => sum + item.qty, 0),
        totalAmountSubunits: newItems.reduce((sum, item) => sum + item.unitPriceSubunits * item.qty, 0),
      }
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter(
        (item) => !(item.serviceId === action.payload.serviceId && item.optionId === action.payload.optionId),
      )

      return {
        items: newItems,
        totalItems: newItems.reduce((sum, item) => sum + item.qty, 0),
        totalAmountSubunits: newItems.reduce((sum, item) => sum + item.unitPriceSubunits * item.qty, 0),
      }
    }

    case "UPDATE_QUANTITY": {
      const newItems = state.items
        .map((item) =>
          item.serviceId === action.payload.serviceId && item.optionId === action.payload.optionId
            ? { ...item, qty: Math.max(0, action.payload.qty) }
            : item,
        )
        .filter((item) => item.qty > 0)

      return {
        items: newItems,
        totalItems: newItems.reduce((sum, item) => sum + item.qty, 0),
        totalAmountSubunits: newItems.reduce((sum, item) => sum + item.unitPriceSubunits * item.qty, 0),
      }
    }

    case "CLEAR_CART":
      return {
        items: [],
        totalItems: 0,
        totalAmountSubunits: 0,
      }

    case "LOAD_CART": {
      const items = action.payload
      return {
        items,
        totalItems: items.reduce((sum, item) => sum + item.qty, 0),
        totalAmountSubunits: items.reduce((sum, item) => sum + item.unitPriceSubunits * item.qty, 0),
      }
    }

    default:
      return state
  }
}

interface CartContextType extends CartState {
  addItem: (item: Omit<CartItem, "qty">) => void
  removeItem: (serviceId: string, optionId: string) => void
  updateQuantity: (serviceId: string, optionId: string, qty: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    totalItems: 0,
    totalAmountSubunits: 0,
  })

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = getStorageItem<CartItem[]>("uc-cart", [])
    if (savedCart.length > 0) {
      dispatch({ type: "LOAD_CART", payload: savedCart })
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    setStorageItem("uc-cart", state.items)
  }, [state.items])

  const addItem = (item: Omit<CartItem, "qty">) => {
    dispatch({ type: "ADD_ITEM", payload: item })
  }

  const removeItem = (serviceId: string, optionId: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: { serviceId, optionId } })
  }

  const updateQuantity = (serviceId: string, optionId: string, qty: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { serviceId, optionId, qty } })
  }

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" })
  }

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
