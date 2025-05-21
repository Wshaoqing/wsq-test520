export interface Transaction {
    id: string
    username: string
    transactionType: TransactionType
    token: string
    amount: string
    date: string
    status?: "canceled" | "successful" | "waiting"
    description?: string
}

export type TransactionType = "Stake" | "Borrow" | "Lend"

// Base URL for API requests
const API_BASE_URL = "http://localhost:5001/api"

// Fetch transactions with all supported query parameters
export const fetchTransactions = async (params?: {
    page?: number
    limit?: number
    search?: string
    sortField?: string
    sortOrder?: "asc" | "desc"
    startDate?: string
    endDate?: string
    transactionType?: string
}): Promise<Transaction[]> => {
    try {
        // Build query string from params
        const queryParams = new URLSearchParams()
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, value.toString())
                }
            })
        }
        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""

        // For development, always use mock data to avoid API errors
        // In production, uncomment the API call below
        const response = await fetch(`${API_BASE_URL}/transactions${queryString}`)

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }
        const data = await response.json();
        return data;


        // Use mock data for development
        console.log("Using mock data (API call disabled)")
        return getMockTransactions(params)
    } catch (error) {
        console.error("Error fetching transactions:", error)
        // Return mock data as fallback
        return getMockTransactions(params)
    }
}

// Create a new transaction
export const createTransaction = async (transaction: Omit<Transaction, "id">): Promise<Transaction> => {
    try {
        // For development, use mock implementation
        // In production, uncomment the API call below
        const response = await fetch(`${API_BASE_URL}/transactions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(transaction),
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        return await response.json()

        // Mock implementation
        console.log("Creating transaction (mock):", transaction)
        await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate API delay

        return {
            ...transaction,
            id: Math.random().toString(36).substring(2, 15),
        } as Transaction
    } catch (error) {
        console.error("Error creating transaction:", error)
        // Return mock data for development/fallback
        return {
            ...transaction,
            id: Math.random().toString(36).substring(2, 15),
        } as Transaction
    }
}

// Update an existing transaction
export const updateTransaction = async (id: string, transaction: Partial<Transaction>): Promise<Transaction> => {
    try {
        // For development, use mock implementation
        // In production, uncomment the API call below
        const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(transaction),
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        return await response.json()

        // Mock implementation
        console.log("Updating transaction (mock):", id, transaction)
        await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate API delay

        return {
            id,
            username: "user",
            transactionType: "Stake",
            token: "ETH",
            amount: "1.0",
            date: new Date().toISOString().split("T")[0],
            ...transaction,
        } as Transaction
    } catch (error) {
        console.error("Error updating transaction:", error)
        throw error
    }
}

// Delete a transaction
export const deleteTransaction = async (id: string): Promise<void> => {
    try {
        // For development, use mock implementation
        // In production, uncomment the API call below
        const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        // Mock implementation
        console.log("Deleting transaction (mock):", id)
        await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate API delay
    } catch (error) {
        console.error("Error deleting transaction:", error)
        throw error
    }
}

// Mock data function for development/fallback
function getMockTransactions(params?: any): Transaction[] {
    let mockTransactions: Transaction[] = [
        {
            id: "1",
            username: "john.doe",
            transactionType: "Stake",
            token: "ETH",
            amount: "1.5",
            date: "2024-01-20",
        },
        {
            id: "2",
            username: "jane.smith",
            transactionType: "Borrow",
            token: "USDC",
            amount: "500",
            date: "2024-01-22",
        },
        {
            id: "3",
            username: "john.doe",
            transactionType: "Lend",
            token: "DAI",
            amount: "250",
            date: "2024-01-25",
        },
        {
            id: "4",
            username: "alice.crypto",
            transactionType: "Stake",
            token: "BTC",
            amount: "0.25",
            date: "2024-01-18",
        },
        {
            id: "5",
            username: "bob.blockchain",
            transactionType: "Borrow",
            token: "ETH",
            amount: "3.2",
            date: "2024-01-15",
        },
        {
            id: "6",
            username: "charlie.defi",
            transactionType: "Lend",
            token: "USDC",
            amount: "1000",
            date: "2024-01-10",
        },
        {
            id: "7",
            username: "dave.trader",
            transactionType: "Stake",
            token: "ETH",
            amount: "2.75",
            date: "2024-01-05",
        },
        {
            id: "8",
            username: "eve.investor",
            transactionType: "Borrow",
            token: "DAI",
            amount: "750",
            date: "2024-01-12",
        },
        {
            id: "9",
            username: "frank.hodler",
            transactionType: "Lend",
            token: "BTC",
            amount: "0.5",
            date: "2024-01-08",
        },
        {
            id: "10",
            username: "grace.whale",
            transactionType: "Stake",
            token: "USDC",
            amount: "2000",
            date: "2024-01-03",
        },
        {
            id: "11",
            username: "henry.miner",
            transactionType: "Borrow",
            token: "ETH",
            amount: "5.0",
            date: "2024-01-01",
        },
        {
            id: "12",
            username: "irene.analyst",
            transactionType: "Lend",
            token: "DAI",
            amount: "1500",
            date: "2024-01-17",
        },
    ]

    // Apply filters if provided
    if (params) {
        // Search filter
        if (params.search) {
            const searchTerm = params.search.toLowerCase()
            mockTransactions = mockTransactions.filter(
                (tx) => tx.username.toLowerCase().includes(searchTerm) || tx.token.toLowerCase().includes(searchTerm),
            )
        }

        // Transaction type filter
        if (params.transactionType && params.transactionType !== "all") {
            mockTransactions = mockTransactions.filter((tx) => tx.transactionType === params.transactionType)
        }

        // Date range filter
        if (params.startDate) {
            const startDate = new Date(params.startDate)
            mockTransactions = mockTransactions.filter((tx) => new Date(tx.date) >= startDate)
        }

        if (params.endDate) {
            const endDate = new Date(params.endDate)
            mockTransactions = mockTransactions.filter((tx) => new Date(tx.date) <= endDate)
        }

        // Apply sorting
        if (params.sortField) {
            mockTransactions.sort((a, b) => {
                let valueA, valueB

                if (params.sortField === "amount") {
                    valueA = Number.parseFloat(a.amount)
                    valueB = Number.parseFloat(b.amount)
                } else if (params.sortField === "date") {
                    valueA = new Date(a.date).getTime()
                    valueB = new Date(b.date).getTime()
                } else {
                    valueA = a[params.sortField as keyof Transaction]
                    valueB = b[params.sortField as keyof Transaction]
                }

                const direction = params.sortOrder === "desc" ? -1 : 1

                if (valueA < valueB) return -1 * direction
                if (valueA > valueB) return 1 * direction
                return 0
            })
        }

        // Apply pagination
        if (params.page && params.limit) {
            const startIndex = (params.page - 1) * params.limit
            mockTransactions = mockTransactions.slice(startIndex, startIndex + params.limit)
        }
    }

    return mockTransactions
}
