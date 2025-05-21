"use client"

import { useState, useEffect, Fragment } from "react"
import { Dialog, Transition, Listbox } from "@headlessui/react"
import {
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    CheckIcon,
    ExclamationCircleIcon,
    PlusIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline"
import classNames from "classnames"
import {
    fetchTransactions,
    createTransaction,
    deleteTransaction,
    type Transaction,
    type TransactionType,
} from "../api/api"

// Transaction types for filtering
const TRANSACTION_TYPES = [
    { id: "all", name: "All Types" },
    { id: "Stake", name: "Stake" },
    { id: "Borrow", name: "Borrow" },
    { id: "Lend", name: "Lend" },
]

// Token options for new transactions
const TOKEN_OPTIONS = [
    { id: "ETH", name: "Ethereum (ETH)" },
    { id: "USDC", name: "USD Coin (USDC)" },
    { id: "DAI", name: "Dai (DAI)" },
    { id: "BTC", name: "Bitcoin (BTC)" },
]

// Status options
const STATUS_OPTIONS = [
    { id: "successful", name: "Successful" },
    { id: "waiting", name: "Waiting" },
    { id: "canceled", name: "Canceled" },
]

const ITEMS_PER_PAGE = 5

// Color mapping for transaction types
const getTransactionTypeColor = (type: string) => {
    switch (type) {
        case "Stake":
            return "bg-green-100 text-green-800"
        case "Borrow":
            return "bg-red-100 text-red-800"
        case "Lend":
            return "bg-blue-100 text-blue-800"
        default:
            return "bg-gray-100 text-gray-800"
    }
}

// Color mapping for tokens
const getTokenBadgeColor = (token: string) => {
    switch (token) {
        case "ETH":
            return "bg-blue-100 text-blue-800"
        case "USDC":
            return "bg-green-100 text-green-800"
        case "DAI":
            return "bg-yellow-100 text-yellow-800"
        case "BTC":
            return "bg-orange-100 text-orange-800"
        default:
            return "bg-gray-100 text-gray-800"
    }
}

// Color mapping for status
const getStatusColor = (status?: string) => {
    switch (status) {
        case "successful":
            return "bg-green-100 text-green-800"
        case "waiting":
            return "bg-yellow-100 text-yellow-800"
        case "canceled":
            return "bg-red-100 text-red-800"
        default:
            return "bg-gray-100 text-gray-500"
    }
}

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedType, setSelectedType] = useState(TRANSACTION_TYPES[0])
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
    const [newTransaction, setNewTransaction] = useState<Omit<Transaction, "id">>({
        username: "",
        transactionType: "Stake" as TransactionType,
        token: "ETH",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        status: "waiting",
        description: "",
    })
    const [sortField, setSortField] = useState<string | null>(null)
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
    const [totalCount, setTotalCount] = useState(0)

    // Fetch transactions on component mount and when filters/sort change
    useEffect(() => {
        const getTransactions = async () => {
            try {
                setIsLoading(true)
                setError(null)

                const res = await fetchTransactions({
                    page: currentPage,
                    limit: ITEMS_PER_PAGE,
                    search: searchTerm || undefined,
                    sortField: sortField || undefined,
                    sortOrder: sortOrder,
                    startDate: startDate || undefined,
                    endDate: endDate || undefined,
                    transactionType: selectedType.id !== "all" ? selectedType.id : undefined,
                })

                // Handle different API response formats
                let data: Transaction[] = []
                if (res.data && Array.isArray(res.data)) {
                    data = res.data
                } else if (Array.isArray(res)) {
                    data = res
                } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
                    data = res.data.data
                } else {
                    console.error("Unexpected API response format:", res)
                    data = []
                }

                setTransactions(data)
                setFilteredTransactions(data)

                // For mock data, we'll calculate the total count
                // In a real API, this would come from the response metadata
                setTotalCount(data.length * 3) // Simulate more data for pagination
            } catch (err) {
                console.error("Error in component when fetching transactions:", err)
                setError("Failed to load transactions. Please try again later.")
                setTransactions([])
                setFilteredTransactions([])
            } finally {
                setIsLoading(false)
            }
        }

        getTransactions()
    }, [currentPage, sortField, sortOrder, searchTerm, selectedType, startDate, endDate])

    // Pagination calculations
    const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE))

    // Handle adding a new transaction
    const handleAddTransaction = async () => {
        // Validate form
        const errors: { [key: string]: string } = {}
        if (!newTransaction.username.trim()) errors.username = "Username is required"
        if (!newTransaction.amount) errors.amount = "Amount is required"
        if (!newTransaction.date) errors.date = "Date is required"

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors)
            return
        }

        try {
            setIsLoading(true)

            const created = await createTransaction(newTransaction)

            // Refresh the transaction list
            const res = await fetchTransactions({
                page: currentPage,
                limit: ITEMS_PER_PAGE,
                sortField: sortField || undefined,
                sortOrder: sortOrder,
                transactionType: selectedType.id !== "all" ? selectedType.id : undefined,
            })

            // Handle different API response formats
            let updatedData: Transaction[] = []
            if (res.data && Array.isArray(res.data)) {
                updatedData = res.data
            } else if (Array.isArray(res)) {
                updatedData = res
            } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
                updatedData = res.data.data
            } else {
                console.error("Unexpected API response format:", res)
                updatedData = []
            }

            setTransactions(updatedData)
            setFilteredTransactions(updatedData)

            setIsAddModalOpen(false)
            setNewTransaction({
                username: "",
                transactionType: "Stake",
                token: "ETH",
                amount: "",
                date: new Date().toISOString().split("T")[0],
                status: "waiting",
                description: "",
            })
            setFormErrors({})
        } catch (err) {
            console.error("Error adding transaction:", err)
            setError("Failed to add transaction. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    // Handle deleting a transaction
    const handleDeleteTransaction = async () => {
        if (!selectedTransaction) return

        try {
            setIsLoading(true)
            console.log(selectedTransaction)
            console.log(selectedTransaction._id)
            await deleteTransaction(selectedTransaction._id)

            // Refresh the transaction list
            const res = await fetchTransactions({
                page: currentPage,
                limit: ITEMS_PER_PAGE,
                sortField: sortField || undefined,
                sortOrder: sortOrder,
                transactionType: selectedType.id !== "all" ? selectedType.id : undefined,
            })

            // Handle different API response formats
            let updatedData: Transaction[] = []
            if (res.data && Array.isArray(res.data)) {
                updatedData = res.data
            } else if (Array.isArray(res)) {
                updatedData = res
            } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
                updatedData = res.data.data
            } else {
                console.error("Unexpected API response format:", res)
                updatedData = []
            }

            setTransactions(updatedData)
            setFilteredTransactions(updatedData)

            setIsDeleteModalOpen(false)
            setSelectedTransaction(null)
        } catch (err) {
            console.error("Error deleting transaction:", err)
            setError("Failed to delete transaction. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    // Handle sorting
    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortOrder("asc")
        }
    }

    // Get sort indicator
    const getSortIndicator = (field: string) => {
        if (sortField !== field) return null

        return sortOrder === "asc" ? <ArrowUpIcon className="h-4 w-4 ml-1" /> : <ArrowDownIcon className="h-4 w-4 ml-1" />
    }

    return (
        <div className="py-10">
            <header>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Transactions</h1>
                    <p className="mt-1 text-sm text-gray-500">View and manage your cryptocurrency transactions</p>
                </div>
            </header>
            <main>
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {error && (
                        <div className="rounded-md bg-red-50 p-4 mb-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">There was an error</h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <p>{error}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Filters - Improved layout */}
                    <div className="mb-8 rounded-lg bg-white p-6 shadow-md border border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
                        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
                            {/* Search input - improved styling */}
                            <div className="col-span-1">
                                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                                    Search
                                </label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </div>
                                    <input
                                        type="text"
                                        name="search"
                                        id="search"
                                        className="block w-full rounded-md border-gray-300 pl-10 pr-3 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        placeholder="Username or token..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Transaction type filter - improved styling */}
                            <div className="col-span-1">
                                <label htmlFor="transaction-type" className="block text-sm font-medium text-gray-700 mb-1">
                                    Transaction Type
                                </label>
                                <Listbox value={selectedType} onChange={setSelectedType}>
                                    {({ open }) => (
                                        <div className="relative">
                                            <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm">
                                                <span className="block truncate">{selectedType.name}</span>
                                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </span>
                                            </Listbox.Button>

                                            <Transition
                                                show={open}
                                                as={Fragment}
                                                leave="transition ease-in duration-100"
                                                leaveFrom="opacity-100"
                                                leaveTo="opacity-0"
                                            >
                                                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                    {TRANSACTION_TYPES.map((type) => (
                                                        <Listbox.Option
                                                            key={type.id}
                                                            className={({ active }) =>
                                                                classNames(
                                                                    active ? "bg-blue-600 text-white" : "text-gray-900",
                                                                    "relative cursor-default select-none py-2 pl-3 pr-9",
                                                                )
                                                            }
                                                            value={type}
                                                        >
                                                            {({ selected, active }) => (
                                                                <>
                                  <span
                                      className={classNames(selected ? "font-semibold" : "font-normal", "block truncate")}
                                  >
                                    {type.name}
                                  </span>

                                                                    {selected ? (
                                                                        <span
                                                                            className={classNames(
                                                                                active ? "text-white" : "text-blue-600",
                                                                                "absolute inset-y-0 right-0 flex items-center pr-4",
                                                                            )}
                                                                        >
                                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                    </span>
                                                                    ) : null}
                                                                </>
                                                            )}
                                                        </Listbox.Option>
                                                    ))}
                                                </Listbox.Options>
                                            </Transition>
                                        </div>
                                    )}
                                </Listbox>
                            </div>

                            {/* Date range filters - improved styling */}
                            <div className="col-span-1">
                                <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Date
                                </label>
                                <div className="relative rounded-md shadow-sm">
                                    <input
                                        type="date"
                                        name="start-date"
                                        id="start-date"
                                        className="block w-full rounded-md border-gray-300 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="col-span-1">
                                <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                                    End Date
                                </label>
                                <div className="relative rounded-md shadow-sm">
                                    <input
                                        type="date"
                                        name="end-date"
                                        id="end-date"
                                        className="block w-full rounded-md border-gray-300 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCurrentPage(1) // Reset to first page when applying filters
                                    }}
                                    className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    disabled={isLoading}
                                >
                                    <FunnelIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                    Apply Filters
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchTerm("")
                                        setSelectedType(TRANSACTION_TYPES[0])
                                        setStartDate("")
                                        setEndDate("")
                                        setSortField(null)
                                        setSortOrder("asc")
                                        setCurrentPage(1)
                                    }}
                                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    disabled={isLoading}
                                >
                                    Reset
                                </button>
                            </div>
                            <div>
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                >
                                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                    Add Transaction
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Transactions table */}
                    <div className="overflow-hidden rounded-lg bg-white shadow-md border border-gray-200">
                        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                            <h2 className="text-lg font-medium leading-6 text-gray-900">Transaction History</h2>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">A list of all transactions in your account</p>
                        </div>
                        <div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                                        >
                                            Username
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Transaction Type
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Token
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                                            onClick={() => handleSort("amount")}
                                        >
                                            <div className="flex items-center">
                                                Amount
                                                {getSortIndicator("amount")}
                                            </div>
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                                            onClick={() => handleSort("date")}
                                        >
                                            <div className="flex items-center">
                                                Date
                                                {getSortIndicator("date")}
                                            </div>
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Status
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Description
                                        </th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                            Actions
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={8} className="py-10 text-center">
                                                <div className="flex justify-center">
                                                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
                                                </div>
                                                <p className="mt-2 text-sm text-gray-500">Loading transactions...</p>
                                            </td>
                                        </tr>
                                    ) : filteredTransactions.length > 0 ? (
                                        filteredTransactions.map((transaction, index) => (
                                            <tr
                                                key={transaction.id}
                                                className={index % 2 === 0 ? "bg-white hover:bg-gray-50" : "bg-gray-50 hover:bg-gray-100"}
                                            >
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                    {transaction.username}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span
                                className={classNames(
                                    getTransactionTypeColor(transaction.transactionType),
                                    "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold leading-5",
                                )}
                            >
                              {transaction.transactionType}
                            </span>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span
                                className={classNames(
                                    getTokenBadgeColor(transaction.token),
                                    "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold leading-5",
                                )}
                            >
                              {transaction.token}
                            </span>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-medium">
                                                    {typeof transaction.amount === "string"
                                                        ? Number.parseFloat(transaction.amount).toFixed(4)
                                                        : transaction.amount.toFixed(4)}{" "}
                                                    {transaction.token}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {new Date(transaction.date).toLocaleDateString()}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span
                                className={classNames(
                                    getStatusColor(transaction.status),
                                    "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold leading-5",
                                )}
                            >
                              {transaction.status || "Unknown"}
                            </span>
                                                </td>
                                                <td className="px-3 py-4 text-sm text-gray-500 max-w-xs">
                                                    {transaction.description ? (
                                                        <div className="relative group">
                                                            <div className="truncate">{transaction.description}</div>
                                                            {transaction.description.length > 30 && (
                                                                <div className="hidden group-hover:block absolute z-10 left-0 top-full mt-1 p-2 bg-gray-800 text-white text-xs rounded shadow-lg max-w-xs">
                                                                    {transaction.description}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">No description</span>
                                                    )}
                                                </td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedTransaction(transaction)
                                                            setIsDeleteModalOpen(true)
                                                        }}
                                                        className="text-red-600 hover:text-red-900 font-medium mr-2 rounded-md px-2 py-1 hover:bg-red-50 transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={8} className="py-10 text-center">
                                                <p className="text-sm text-gray-500">No transactions found matching your criteria.</p>
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination - always visible */}
                        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3 sm:px-6">
                            <div className="flex flex-1 items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing{" "}
                                        <span className="font-medium">
                      {filteredTransactions.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}
                    </span>{" "}
                                        to <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, totalCount)}</span> of{" "}
                                        <span className="font-medium">{totalCount}</span> results
                                    </p>
                                </div>
                                <div>
                                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                        <button
                                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className={classNames(
                                                currentPage === 1 ? "cursor-not-allowed opacity-50" : "hover:bg-gray-50",
                                                "relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 focus:z-20",
                                            )}
                                        >
                                            <span className="sr-only">Previous</span>
                                            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                                        </button>
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            // Show at most 5 page buttons
                                            let pageNum = i + 1
                                            if (currentPage > 3 && totalPages > 5) {
                                                // Adjust which pages are shown when current page is further along
                                                pageNum = Math.min(currentPage - 2 + i, totalPages)
                                                if (pageNum > totalPages - 4) {
                                                    pageNum = totalPages - 4 + i
                                                }
                                            }
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={classNames(
                                                        pageNum === currentPage
                                                            ? "z-10 border-blue-500 bg-blue-50 text-blue-600"
                                                            : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50",
                                                        "relative inline-flex items-center border px-4 py-2 text-sm font-medium focus:z-20",
                                                    )}
                                                >
                                                    {pageNum}
                                                </button>
                                            )
                                        })}
                                        <button
                                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className={classNames(
                                                currentPage === totalPages ? "cursor-not-allowed opacity-50" : "hover:bg-gray-50",
                                                "relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 focus:z-20",
                                            )}
                                        >
                                            <span className="sr-only">Next</span>
                                            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Add Transaction Modal with improved Headless UI styling */}
            <Transition.Root show={isAddModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={() => setIsAddModalOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                                    <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                                        <button
                                            type="button"
                                            className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                            onClick={() => setIsAddModalOpen(false)}
                                        >
                                            <span className="sr-only">Close</span>
                                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                        </button>
                                    </div>

                                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6">
                                        <div className="sm:flex sm:items-start">
                                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                                                <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                                                    Add New Transaction
                                                </Dialog.Title>
                                                <div className="mt-4">
                                                    <div className="space-y-6">
                                                        <div>
                                                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                                                Username
                                                            </label>
                                                            <div className="mt-1">
                                                                <input
                                                                    type="text"
                                                                    id="username"
                                                                    className={classNames(
                                                                        "shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md",
                                                                        formErrors.username ? "border-red-300" : "",
                                                                    )}
                                                                    value={newTransaction.username}
                                                                    onChange={(e) => setNewTransaction({ ...newTransaction, username: e.target.value })}
                                                                />
                                                                {formErrors.username && (
                                                                    <p className="mt-2 text-sm text-red-600">{formErrors.username}</p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label htmlFor="transactionType" className="block text-sm font-medium text-gray-700">
                                                                Transaction Type
                                                            </label>
                                                            <div className="mt-1">
                                                                <Listbox
                                                                    value={newTransaction.transactionType}
                                                                    onChange={(value) =>
                                                                        setNewTransaction({ ...newTransaction, transactionType: value as TransactionType })
                                                                    }
                                                                >
                                                                    {({ open }) => (
                                                                        <>
                                                                            <div className="relative">
                                                                                <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm">
                                                                                    <span className="block truncate">{newTransaction.transactionType}</span>
                                                                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                            <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                          </span>
                                                                                </Listbox.Button>

                                                                                <Transition
                                                                                    show={open}
                                                                                    as={Fragment}
                                                                                    leave="transition ease-in duration-100"
                                                                                    leaveFrom="opacity-100"
                                                                                    leaveTo="opacity-0"
                                                                                >
                                                                                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                                                        {["Stake", "Borrow", "Lend"].map((type) => (
                                                                                            <Listbox.Option
                                                                                                key={type}
                                                                                                className={({ active }) =>
                                                                                                    classNames(
                                                                                                        active ? "bg-blue-600 text-white" : "text-gray-900",
                                                                                                        "relative cursor-default select-none py-2 pl-3 pr-9",
                                                                                                    )
                                                                                                }
                                                                                                value={type}
                                                                                            >
                                                                                                {({ selected, active }) => (
                                                                                                    <>
                                                    <span
                                                        className={classNames(
                                                            selected ? "font-semibold" : "font-normal",
                                                            "block truncate",
                                                        )}
                                                    >
                                                      {type}
                                                    </span>

                                                                                                        {selected ? (
                                                                                                            <span
                                                                                                                className={classNames(
                                                                                                                    active ? "text-white" : "text-blue-600",
                                                                                                                    "absolute inset-y-0 right-0 flex items-center pr-4",
                                                                                                                )}
                                                                                                            >
                                                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                      </span>
                                                                                                        ) : null}
                                                                                                    </>
                                                                                                )}
                                                                                            </Listbox.Option>
                                                                                        ))}
                                                                                    </Listbox.Options>
                                                                                </Transition>
                                                                            </div>
                                                                        </>
                                                                    )}
                                                                </Listbox>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label htmlFor="token" className="block text-sm font-medium text-gray-700">
                                                                Token
                                                            </label>
                                                            <div className="mt-1">
                                                                <Listbox
                                                                    value={newTransaction.token}
                                                                    onChange={(value) => setNewTransaction({ ...newTransaction, token: value })}
                                                                >
                                                                    {({ open }) => (
                                                                        <>
                                                                            <div className="relative">
                                                                                <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm">
                                          <span className="block truncate">
                                            {TOKEN_OPTIONS.find((t) => t.id === newTransaction.token)?.name ||
                                                newTransaction.token}
                                          </span>
                                                                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                            <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                          </span>
                                                                                </Listbox.Button>

                                                                                <Transition
                                                                                    show={open}
                                                                                    as={Fragment}
                                                                                    leave="transition ease-in duration-100"
                                                                                    leaveFrom="opacity-100"
                                                                                    leaveTo="opacity-0"
                                                                                >
                                                                                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                                                        {TOKEN_OPTIONS.map((token) => (
                                                                                            <Listbox.Option
                                                                                                key={token.id}
                                                                                                className={({ active }) =>
                                                                                                    classNames(
                                                                                                        active ? "bg-blue-600 text-white" : "text-gray-900",
                                                                                                        "relative cursor-default select-none py-2 pl-3 pr-9",
                                                                                                    )
                                                                                                }
                                                                                                value={token.id}
                                                                                            >
                                                                                                {({ selected, active }) => (
                                                                                                    <>
                                                    <span
                                                        className={classNames(
                                                            selected ? "font-semibold" : "font-normal",
                                                            "block truncate",
                                                        )}
                                                    >
                                                      {token.name}
                                                    </span>

                                                                                                        {selected ? (
                                                                                                            <span
                                                                                                                className={classNames(
                                                                                                                    active ? "text-white" : "text-blue-600",
                                                                                                                    "absolute inset-y-0 right-0 flex items-center pr-4",
                                                                                                                )}
                                                                                                            >
                                                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                      </span>
                                                                                                        ) : null}
                                                                                                    </>
                                                                                                )}
                                                                                            </Listbox.Option>
                                                                                        ))}
                                                                                    </Listbox.Options>
                                                                                </Transition>
                                                                            </div>
                                                                        </>
                                                                    )}
                                                                </Listbox>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                                                                Amount
                                                            </label>
                                                            <div className="mt-1">
                                                                <input
                                                                    type="number"
                                                                    id="amount"
                                                                    step="0.0001"
                                                                    className={classNames(
                                                                        "shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md",
                                                                        formErrors.amount ? "border-red-300" : "",
                                                                    )}
                                                                    value={newTransaction.amount}
                                                                    onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                                                                />
                                                                {formErrors.amount && <p className="mt-2 text-sm text-red-600">{formErrors.amount}</p>}
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                                                                Date
                                                            </label>
                                                            <div className="mt-1">
                                                                <input
                                                                    type="date"
                                                                    id="date"
                                                                    className={classNames(
                                                                        "shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md",
                                                                        formErrors.date ? "border-red-300" : "",
                                                                    )}
                                                                    value={newTransaction.date}
                                                                    onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                                                                />
                                                                {formErrors.date && <p className="mt-2 text-sm text-red-600">{formErrors.date}</p>}
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                                                Status
                                                            </label>
                                                            <div className="mt-1">
                                                                <Listbox
                                                                    value={newTransaction.status || "waiting"}
                                                                    onChange={(value) => setNewTransaction({ ...newTransaction, status: value })}
                                                                >
                                                                    {({ open }) => (
                                                                        <>
                                                                            <div className="relative">
                                                                                <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm">
                                                                                    <span className="block truncate">{newTransaction.status || "waiting"}</span>
                                                                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                            <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                          </span>
                                                                                </Listbox.Button>

                                                                                <Transition
                                                                                    show={open}
                                                                                    as={Fragment}
                                                                                    leave="transition ease-in duration-100"
                                                                                    leaveFrom="opacity-100"
                                                                                    leaveTo="opacity-0"
                                                                                >
                                                                                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                                                        {STATUS_OPTIONS.map((status) => (
                                                                                            <Listbox.Option
                                                                                                key={status.id}
                                                                                                className={({ active }) =>
                                                                                                    classNames(
                                                                                                        active ? "bg-blue-600 text-white" : "text-gray-900",
                                                                                                        "relative cursor-default select-none py-2 pl-3 pr-9",
                                                                                                    )
                                                                                                }
                                                                                                value={status.id}
                                                                                            >
                                                                                                {({ selected, active }) => (
                                                                                                    <>
                                                    <span
                                                        className={classNames(
                                                            selected ? "font-semibold" : "font-normal",
                                                            "block truncate",
                                                        )}
                                                    >
                                                      {status.name}
                                                    </span>

                                                                                                        {selected ? (
                                                                                                            <span
                                                                                                                className={classNames(
                                                                                                                    active ? "text-white" : "text-blue-600",
                                                                                                                    "absolute inset-y-0 right-0 flex items-center pr-4",
                                                                                                                )}
                                                                                                            >
                                                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                      </span>
                                                                                                        ) : null}
                                                                                                    </>
                                                                                                )}
                                                                                            </Listbox.Option>
                                                                                        ))}
                                                                                    </Listbox.Options>
                                                                                </Transition>
                                                                            </div>
                                                                        </>
                                                                    )}
                                                                </Listbox>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                                                Description
                                                            </label>
                                                            <div className="mt-1">
                                <textarea
                                    id="description"
                                    rows={3}
                                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    placeholder="Enter transaction details..."
                                    value={newTransaction.description || ""}
                                    onChange={(e) =>
                                        setNewTransaction({ ...newTransaction, description: e.target.value })
                                    }
                                />
                                                            </div>
                                                            <p className="mt-1 text-xs text-gray-500">
                                                                Provide additional details about this transaction.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                        <button
                                            type="button"
                                            className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                                            onClick={handleAddTransaction}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <div className="flex items-center">
                                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-blue-200 mr-2"></div>
                                                    <span>Adding...</span>
                                                </div>
                                            ) : (
                                                "Add Transaction"
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                            onClick={() => setIsAddModalOpen(false)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>

            {/* Delete Transaction Modal */}
            <Transition.Root show={isDeleteModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={() => setIsDeleteModalOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                        <div className="sm:flex sm:items-start">
                                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                                <ExclamationCircleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                                            </div>
                                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                                <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                                                    Delete Transaction
                                                </Dialog.Title>
                                                <div className="mt-2">
                                                    <p className="text-sm text-gray-500">
                                                        Are you sure you want to delete this transaction? This action cannot be undone.
                                                    </p>
                                                </div>

                                                {selectedTransaction && (
                                                    <div className="mt-4 bg-gray-50 p-4 rounded-md">
                                                        <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                                                            <div className="sm:col-span-1">
                                                                <dt className="text-sm font-medium text-gray-500">Username</dt>
                                                                <dd className="mt-1 text-sm text-gray-900">{selectedTransaction.username}</dd>
                                                            </div>
                                                            <div className="sm:col-span-1">
                                                                <dt className="text-sm font-medium text-gray-500">Type</dt>
                                                                <dd className="mt-1 text-sm text-gray-900">{selectedTransaction.transactionType}</dd>
                                                            </div>
                                                            <div className="sm:col-span-1">
                                                                <dt className="text-sm font-medium text-gray-500">Token</dt>
                                                                <dd className="mt-1 text-sm text-gray-900">{selectedTransaction.token}</dd>
                                                            </div>
                                                            <div className="sm:col-span-1">
                                                                <dt className="text-sm font-medium text-gray-500">Amount</dt>
                                                                <dd className="mt-1 text-sm text-gray-900">
                                                                    {typeof selectedTransaction.amount === "string"
                                                                        ? Number.parseFloat(selectedTransaction.amount).toFixed(4)
                                                                        : selectedTransaction.amount.toFixed(4)}{" "}
                                                                    {selectedTransaction.token}
                                                                </dd>
                                                            </div>
                                                            <div className="sm:col-span-1">
                                                                <dt className="text-sm font-medium text-gray-500">Date</dt>
                                                                <dd className="mt-1 text-sm text-gray-900">
                                                                    {new Date(selectedTransaction.date).toLocaleDateString()}
                                                                </dd>
                                                            </div>
                                                            <div className="sm:col-span-1">
                                                                <dt className="text-sm font-medium text-gray-500">Status</dt>
                                                                <dd className="mt-1 text-sm text-gray-900">
                                  <span
                                      className={classNames(
                                          getStatusColor(selectedTransaction.status),
                                          "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                                      )}
                                  >
                                    {selectedTransaction.status || "Unknown"}
                                  </span>
                                                                </dd>
                                                            </div>
                                                            {selectedTransaction.description && (
                                                                <div className="sm:col-span-2">
                                                                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                                                                    <dd className="mt-1 text-sm text-gray-900">{selectedTransaction.description}</dd>
                                                                </div>
                                                            )}
                                                        </dl>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                        <button
                                            type="button"
                                            className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                                            onClick={handleDeleteTransaction}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <div className="flex items-center">
                                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-red-200 mr-2"></div>
                                                    <span>Deleting...</span>
                                                </div>
                                            ) : (
                                                "Delete"
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                            onClick={() => setIsDeleteModalOpen(false)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        </div>
    )
}
