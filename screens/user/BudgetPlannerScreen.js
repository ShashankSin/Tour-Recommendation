import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

function BudgetPlannerScreen({ navigation }) {
  // Main states
  const [budget, setBudget] = useState('5000')
  const [editingBudget, setEditingBudget] = useState(false)
  const [tempBudget, setTempBudget] = useState('5000')
  const [expenses, setExpenses] = useState([
    {
      id: '1',
      category: 'Accommodation',
      amount: 1200,
      icon: 'bed-outline',
      priority: 'high',
      included: true,
    },
    {
      id: '2',
      category: 'Transportation',
      amount: 800,
      icon: 'car-outline',
      priority: 'high',
      included: true,
    },
    {
      id: '3',
      category: 'Food',
      amount: 600,
      icon: 'restaurant-outline',
      priority: 'medium',
      included: true,
    },
    {
      id: '4',
      category: 'Activities',
      amount: 450,
      icon: 'bicycle-outline',
      priority: 'low',
      included: true,
    },
  ])

  // Itinerary states
  const [showItineraryPlanner, setShowItineraryPlanner] = useState(false)
  const [itineraryBudget, setItineraryBudget] = useState('')
  const [destination, setDestination] = useState('')
  const [tripDuration, setTripDuration] = useState('')
  const [travelStyle, setTravelStyle] = useState('balanced') // budget, balanced, luxury
  const [searchingItinerary, setSearchingItinerary] = useState(false)
  const [recommendedItineraries, setRecommendedItineraries] = useState([])
  const [selectedItinerary, setSelectedItinerary] = useState(null)
  const [showItineraryDetails, setShowItineraryDetails] = useState(false)

  // New expense states
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [newExpense, setNewExpense] = useState({
    category: 'Food',
    amount: '',
    icon: 'restaurant-outline',
    priority: 'medium',
    included: true,
  })

  // Edit expense states
  const [showEditExpense, setShowEditExpense] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)

  // Budget allocation recommendations
  const recommendedAllocations = {
    Accommodation: 0.35, // 35% of budget
    Transportation: 0.25, // 25% of budget
    Food: 0.2, // 20% of budget
    Activities: 0.15, // 15% of budget
    Miscellaneous: 0.05, // 5% of budget
  }

  // Available categories with icons
  const categories = [
    { name: 'Accommodation', icon: 'bed-outline' },
    { name: 'Transportation', icon: 'car-outline' },
    { name: 'Food', icon: 'restaurant-outline' },
    { name: 'Activities', icon: 'bicycle-outline' },
    { name: 'Shopping', icon: 'cart-outline' },
    { name: 'Miscellaneous', icon: 'apps-outline' },
  ]

  // Priority options
  const priorities = [
    { value: 'high', label: 'Must Have' },
    { value: 'medium', label: 'Important' },
    { value: 'low', label: 'Nice to Have' },
  ]

  // Travel style options
  const travelStyles = [
    { value: 'budget', label: 'Budget' },
    { value: 'balanced', label: 'Balanced' },
    { value: 'luxury', label: 'Luxury' },
  ]

  // Calculate budget metrics
  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  )
  const remaining = parseInt(budget) - totalExpenses
  const budgetPercentUsed = (totalExpenses / parseInt(budget)) * 100

  // Budget warnings
  const [warnings, setWarnings] = useState([])

  // Check budget status and generate warnings
  useEffect(() => {
    const newWarnings = []

    // Overall budget warning
    if (budgetPercentUsed > 90) {
      newWarnings.push('You have used over 90% of your total budget!')
    } else if (budgetPercentUsed > 75) {
      newWarnings.push('You have used over 75% of your total budget.')
    }

    // Category-specific warnings
    const categoryTotals = {}
    expenses.forEach((expense) => {
      if (!categoryTotals[expense.category]) {
        categoryTotals[expense.category] = 0
      }
      categoryTotals[expense.category] += expense.amount
    })

    Object.keys(categoryTotals).forEach((category) => {
      if (recommendedAllocations[category]) {
        const recommendedAmount =
          parseInt(budget) * recommendedAllocations[category]
        if (categoryTotals[category] > recommendedAmount * 1.2) {
          newWarnings.push(
            `Your ${category} expenses are 20% over the recommended amount.`
          )
        }
      }
    })

    setWarnings(newWarnings)
  }, [expenses, budget, budgetPercentUsed])

  // Add a new expense
  const handleAddExpense = () => {
    if (!newExpense.amount || isNaN(Number(newExpense.amount))) {
      Alert.alert(
        'Invalid Amount',
        'Please enter a valid number for the expense amount.'
      )
      return
    }

    const amount = Number(newExpense.amount)
    if (amount <= 0) {
      Alert.alert('Invalid Amount', 'Amount must be greater than zero.')
      return
    }

    const selectedCategory = categories.find(
      (cat) => cat.name === newExpense.category
    )

    setExpenses([
      ...expenses,
      {
        id: Date.now().toString(),
        category: newExpense.category,
        amount: amount,
        icon: selectedCategory ? selectedCategory.icon : 'apps-outline',
        priority: newExpense.priority,
        included: newExpense.included,
      },
    ])

    setNewExpense({
      category: 'Food',
      amount: '',
      icon: 'restaurant-outline',
      priority: 'medium',
      included: true,
    })
    setShowAddExpense(false)
  }

  // Edit an existing expense
  const handleEditExpense = () => {
    if (!editingExpense) return

    if (!editingExpense.amount || isNaN(Number(editingExpense.amount))) {
      Alert.alert(
        'Invalid Amount',
        'Please enter a valid number for the expense amount.'
      )
      return
    }

    const amount = Number(editingExpense.amount)
    if (amount <= 0) {
      Alert.alert('Invalid Amount', 'Amount must be greater than zero.')
      return
    }

    setExpenses(
      expenses.map((expense) =>
        expense.id === editingExpense.id
          ? { ...editingExpense, amount: amount }
          : expense
      )
    )

    setEditingExpense(null)
    setShowEditExpense(false)
  }

  // Delete an expense
  const handleDeleteExpense = (id) => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () =>
            setExpenses(expenses.filter((expense) => expense.id !== id)),
          style: 'destructive',
        },
      ]
    )
  }

  // Update budget
  const handleUpdateBudget = () => {
    if (!tempBudget || isNaN(Number(tempBudget))) {
      Alert.alert(
        'Invalid Budget',
        'Please enter a valid number for your budget.'
      )
      return
    }

    const newBudget = Number(tempBudget)
    if (newBudget <= 0) {
      Alert.alert('Invalid Budget', 'Budget must be greater than zero.')
      return
    }

    setBudget(tempBudget)
    setEditingBudget(false)
  }

  // Toggle expense inclusion in itinerary
  const toggleExpenseInclusion = (id) => {
    setExpenses(
      expenses.map((expense) =>
        expense.id === id
          ? { ...expense, included: !expense.included }
          : expense
      )
    )
  }

  // Update expense priority
  const updateExpensePriority = (id, priority) => {
    setExpenses(
      expenses.map((expense) =>
        expense.id === id ? { ...expense, priority } : expense
      )
    )
  }

  // Get recommended amount for a category
  const getRecommendedAmount = (category) => {
    if (recommendedAllocations[category]) {
      return Math.round(parseInt(budget) * recommendedAllocations[category])
    }
    return null
  }

  // Get category spending status
  const getCategoryStatus = (category) => {
    const categoryTotal = expenses
      .filter((expense) => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0)

    const recommended = getRecommendedAmount(category)

    if (!recommended) return 'normal'

    if (categoryTotal > recommended * 1.2) return 'over'
    if (categoryTotal < recommended * 0.8) return 'under'
    return 'normal'
  }

  // Get color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case 'over':
        return 'text-red-500'
      case 'under':
        return 'text-blue-500'
      default:
        return 'text-green-600'
    }
  }

  // Get priority label
  const getPriorityLabel = (priority) => {
    const found = priorities.find((p) => p.value === priority)
    return found ? found.label : 'Medium'
  }

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700'
      case 'low':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  // Search for itineraries based on user preferences
  const searchItineraries = () => {
    if (!itineraryBudget || isNaN(Number(itineraryBudget))) {
      Alert.alert(
        'Invalid Budget',
        'Please enter a valid budget for your itinerary.'
      )
      return
    }

    if (!destination) {
      Alert.alert(
        'Missing Information',
        'Please enter a destination for your trip.'
      )
      return
    }

    if (!tripDuration || isNaN(Number(tripDuration))) {
      Alert.alert(
        'Invalid Duration',
        'Please enter a valid number of days for your trip.'
      )
      return
    }

    setSearchingItinerary(true)

    // Simulate backend search with a timeout
    setTimeout(() => {
      // Get included expenses and their priorities
      const includedExpenses = expenses.filter((expense) => expense.included)
      const mustHaveExpenses = includedExpenses.filter(
        (expense) => expense.priority === 'high'
      )
      const importantExpenses = includedExpenses.filter(
        (expense) => expense.priority === 'medium'
      )
      const niceToHaveExpenses = includedExpenses.filter(
        (expense) => expense.priority === 'low'
      )

      // Calculate total must-have expenses
      const totalMustHave = mustHaveExpenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      )

      // Check if budget is sufficient for must-have expenses
      if (totalMustHave > Number(itineraryBudget)) {
        setSearchingItinerary(false)
        Alert.alert(
          'Budget Too Low',
          'Your budget is not sufficient for all your must-have expenses. Please increase your budget or adjust your priorities.',
          [{ text: 'OK' }]
        )
        return
      }

      // Generate itineraries based on travel style and budget
      const generatedItineraries = generateItineraries(
        Number(itineraryBudget),
        Number(tripDuration),
        destination,
        travelStyle,
        mustHaveExpenses,
        importantExpenses,
        niceToHaveExpenses
      )

      setRecommendedItineraries(generatedItineraries)
      setSearchingItinerary(false)
    }, 2000) // Simulate 2 second search
  }

  // Generate itineraries based on user preferences
  const generateItineraries = (
    budget,
    duration,
    destination,
    style,
    mustHave,
    important,
    niceToHave
  ) => {
    // This function simulates what would happen in a backend search
    // In a real app, this would be an API call to a backend service

    // Calculate remaining budget after must-have expenses
    const mustHaveTotal = mustHave.reduce(
      (sum, expense) => sum + expense.amount,
      0
    )
    let remainingBudget = budget - mustHaveTotal

    // Calculate daily budget
    const dailyBudget = remainingBudget / duration

    // Create base itinerary with must-have expenses
    const baseItinerary = {
      id: '1',
      name: `${destination} Trip - ${
        style.charAt(0).toUpperCase() + style.slice(1)
      }`,
      totalCost: mustHaveTotal,
      duration: duration,
      expenses: [...mustHave],
      activities: [],
      accommodations: [],
      transportation: [],
      meals: [],
    }

    // Add important expenses as much as budget allows
    for (const expense of important) {
      if (remainingBudget >= expense.amount) {
        baseItinerary.expenses.push(expense)
        baseItinerary.totalCost += expense.amount
        remainingBudget -= expense.amount

        // Categorize expense
        if (expense.category === 'Accommodation') {
          baseItinerary.accommodations.push(expense)
        } else if (expense.category === 'Transportation') {
          baseItinerary.transportation.push(expense)
        } else if (expense.category === 'Food') {
          baseItinerary.meals.push(expense)
        } else if (expense.category === 'Activities') {
          baseItinerary.activities.push(expense)
        }
      }
    }

    // Add nice-to-have expenses if budget allows
    for (const expense of niceToHave) {
      if (remainingBudget >= expense.amount) {
        baseItinerary.expenses.push(expense)
        baseItinerary.totalCost += expense.amount
        remainingBudget -= expense.amount

        // Categorize expense
        if (expense.category === 'Accommodation') {
          baseItinerary.accommodations.push(expense)
        } else if (expense.category === 'Transportation') {
          baseItinerary.transportation.push(expense)
        } else if (expense.category === 'Food') {
          baseItinerary.meals.push(expense)
        } else if (expense.category === 'Activities') {
          baseItinerary.activities.push(expense)
        }
      }
    }

    // Generate sample itineraries based on travel style
    const itineraries = []

    // Add the base itinerary
    itineraries.push(baseItinerary)

    // Generate alternative itineraries based on travel style
    if (style === 'budget') {
      // Budget option - focus on essential experiences, cheaper accommodations
      itineraries.push({
        id: '2',
        name: `${destination} Budget Explorer`,
        totalCost: Math.round(baseItinerary.totalCost * 0.9),
        duration: duration,
        expenses: [...baseItinerary.expenses],
        activities: generateSampleActivities(destination, 'budget', duration),
        accommodations: generateSampleAccommodations(
          destination,
          'budget',
          duration
        ),
        transportation: generateSampleTransportation(destination, 'budget'),
        meals: generateSampleMeals(destination, 'budget', duration),
      })
    } else if (style === 'luxury') {
      // Luxury option - premium experiences, high-end accommodations
      itineraries.push({
        id: '2',
        name: `${destination} Luxury Experience`,
        totalCost: Math.min(budget, Math.round(baseItinerary.totalCost * 1.2)),
        duration: duration,
        expenses: [...baseItinerary.expenses],
        activities: generateSampleActivities(destination, 'luxury', duration),
        accommodations: generateSampleAccommodations(
          destination,
          'luxury',
          duration
        ),
        transportation: generateSampleTransportation(destination, 'luxury'),
        meals: generateSampleMeals(destination, 'luxury', duration),
      })
    } else {
      // Balanced option - mix of experiences
      itineraries.push({
        id: '2',
        name: `${destination} Balanced Adventure`,
        totalCost: Math.round(baseItinerary.totalCost * 1.05),
        duration: duration,
        expenses: [...baseItinerary.expenses],
        activities: generateSampleActivities(destination, 'balanced', duration),
        accommodations: generateSampleAccommodations(
          destination,
          'balanced',
          duration
        ),
        transportation: generateSampleTransportation(destination, 'balanced'),
        meals: generateSampleMeals(destination, 'balanced', duration),
      })
    }

    // Add a third option that's a variation
    itineraries.push({
      id: '3',
      name: `${destination} Alternative Plan`,
      totalCost: Math.round(
        baseItinerary.totalCost * (style === 'budget' ? 0.95 : 1.1)
      ),
      duration: duration,
      expenses: [...baseItinerary.expenses],
      activities: generateSampleActivities(destination, style, duration, true),
      accommodations: generateSampleAccommodations(
        destination,
        style,
        duration,
        true
      ),
      transportation: generateSampleTransportation(destination, style, true),
      meals: generateSampleMeals(destination, style, duration, true),
    })

    return itineraries
  }

  // Helper functions to generate sample itinerary components
  const generateSampleActivities = (
    destination,
    style,
    duration,
    isAlternative = false
  ) => {
    // This would be replaced with actual data from a backend
    const activities = []

    // Sample activities based on destination and style
    if (
      destination.toLowerCase().includes('beach') ||
      destination.toLowerCase().includes('goa')
    ) {
      activities.push(
        { name: 'Beach Day', cost: style === 'luxury' ? 500 : 0, day: 1 },
        {
          name: 'Water Sports',
          cost: style === 'luxury' ? 2000 : style === 'balanced' ? 1200 : 800,
          day: 2,
        }
      )

      if (style !== 'budget' || isAlternative) {
        activities.push({
          name: 'Sunset Cruise',
          cost: style === 'luxury' ? 1500 : 800,
          day: 3,
        })
      }
    } else if (
      destination.toLowerCase().includes('mountain') ||
      destination.toLowerCase().includes('himachal')
    ) {
      activities.push(
        {
          name: 'Hiking Trail',
          cost: style === 'luxury' ? 800 : style === 'balanced' ? 400 : 200,
          day: 1,
        },
        {
          name: 'Local Sightseeing',
          cost: style === 'luxury' ? 1200 : style === 'balanced' ? 600 : 300,
          day: 2,
        }
      )

      if (style !== 'budget' || isAlternative) {
        activities.push({
          name: 'Adventure Sports',
          cost: style === 'luxury' ? 2000 : 1200,
          day: 3,
        })
      }
    } else {
      // Generic activities
      activities.push(
        {
          name: 'City Tour',
          cost: style === 'luxury' ? 1500 : style === 'balanced' ? 800 : 400,
          day: 1,
        },
        {
          name: 'Cultural Experience',
          cost: style === 'luxury' ? 1200 : style === 'balanced' ? 600 : 300,
          day: 2,
        }
      )

      if (style !== 'budget' || isAlternative) {
        activities.push({
          name: 'Local Workshop',
          cost: style === 'luxury' ? 1800 : 1000,
          day: 3,
        })
      }
    }

    // Add more activities based on duration
    if (duration > 3) {
      activities.push({
        name: isAlternative ? 'Nature Excursion' : 'Museum Visit',
        cost: style === 'luxury' ? 1000 : style === 'balanced' ? 500 : 250,
        day: 4,
      })
    }

    if (duration > 4) {
      activities.push({
        name: isAlternative ? 'Local Festival' : 'Shopping Trip',
        cost: style === 'luxury' ? 1500 : style === 'balanced' ? 800 : 400,
        day: 5,
      })
    }

    return activities
  }

  const generateSampleAccommodations = (
    destination,
    style,
    duration,
    isAlternative = false
  ) => {
    // This would be replaced with actual data from a backend
    const accommodations = []

    let dailyCost
    let accommodationType

    if (style === 'luxury') {
      dailyCost = isAlternative ? 3500 : 4000
      accommodationType = isAlternative ? '4-Star Hotel' : '5-Star Resort'
    } else if (style === 'balanced') {
      dailyCost = isAlternative ? 1800 : 2200
      accommodationType = isAlternative ? '3-Star Hotel' : 'Boutique Hotel'
    } else {
      dailyCost = isAlternative ? 800 : 1000
      accommodationType = isAlternative ? 'Hostel' : 'Budget Hotel'
    }

    accommodations.push({
      name: accommodationType,
      cost: dailyCost * duration,
      nights: duration,
    })

    return accommodations
  }

  const generateSampleTransportation = (
    destination,
    style,
    isAlternative = false
  ) => {
    // This would be replaced with actual data from a backend
    const transportation = []

    if (style === 'luxury') {
      transportation.push({
        name: isAlternative ? 'Premium Car Rental' : 'Private Car with Driver',
        cost: isAlternative ? 3000 : 3500,
      })
    } else if (style === 'balanced') {
      transportation.push({
        name: isAlternative ? 'Taxi Services' : 'Car Rental',
        cost: isAlternative ? 1800 : 2000,
      })
    } else {
      transportation.push({
        name: isAlternative ? 'Shared Rides' : 'Public Transportation',
        cost: isAlternative ? 800 : 600,
      })
    }

    return transportation
  }

  const generateSampleMeals = (
    destination,
    style,
    duration,
    isAlternative = false
  ) => {
    // This would be replaced with actual data from a backend
    const meals = []

    let dailyCost
    let mealType

    if (style === 'luxury') {
      dailyCost = isAlternative ? 2000 : 2500
      mealType = isAlternative ? 'Fine Dining' : 'Gourmet Restaurants'
    } else if (style === 'balanced') {
      dailyCost = isAlternative ? 1200 : 1500
      mealType = isAlternative ? 'Casual Restaurants' : 'Mid-range Dining'
    } else {
      dailyCost = isAlternative ? 600 : 800
      mealType = isAlternative ? 'Street Food' : 'Budget Eateries'
    }

    meals.push({
      name: mealType,
      cost: dailyCost * duration,
      days: duration,
    })

    return meals
  }

  // Apply itinerary to current budget plan
  const applyItinerary = (itinerary) => {
    if (!itinerary) return

    // Update budget to match itinerary total cost
    setBudget(itinerary.totalCost.toString())

    // Create new expenses from itinerary
    const newExpenses = []
    let idCounter = 1

    // Add accommodation expenses
    itinerary.accommodations.forEach((accommodation) => {
      newExpenses.push({
        id: (idCounter++).toString(),
        category: 'Accommodation',
        amount: accommodation.cost,
        icon: 'bed-outline',
        priority: 'high',
        included: true,
        name: accommodation.name,
      })
    })

    // Add transportation expenses
    itinerary.transportation.forEach((transport) => {
      newExpenses.push({
        id: (idCounter++).toString(),
        category: 'Transportation',
        amount: transport.cost,
        icon: 'car-outline',
        priority: 'high',
        included: true,
        name: transport.name,
      })
    })

    // Add food expenses
    itinerary.meals.forEach((meal) => {
      newExpenses.push({
        id: (idCounter++).toString(),
        category: 'Food',
        amount: meal.cost,
        icon: 'restaurant-outline',
        priority: 'medium',
        included: true,
        name: meal.name,
      })
    })

    // Add activity expenses
    itinerary.activities.forEach((activity) => {
      newExpenses.push({
        id: (idCounter++).toString(),
        category: 'Activities',
        amount: activity.cost,
        icon: 'bicycle-outline',
        priority: 'low',
        included: true,
        name: activity.name,
      })
    })

    // Update expenses
    setExpenses(newExpenses)

    // Close modals
    setShowItineraryDetails(false)
    setSelectedItinerary(null)
    setRecommendedItineraries([])
    setShowItineraryPlanner(false)

    // Show confirmation
    Alert.alert(
      'Itinerary Applied',
      'The selected itinerary has been applied to your budget plan.',
      [{ text: 'OK' }]
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-orange-50">
      <View className="px-4 py-6 bg-orange-500">
        <Text className="text-2xl font-bold text-white">Budget Planner</Text>
        <Text className="text-white opacity-80">Plan your travel expenses</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Budget Overview */}
        <View className="m-4 p-4 bg-white rounded-xl shadow">
          <Text className="text-gray-500 mb-2">Total Budget</Text>
          {editingBudget ? (
            <View className="flex-row items-center">
              <TextInput
                className="text-3xl font-bold text-orange-500 border-b border-orange-300 w-40"
                value={tempBudget}
                onChangeText={setTempBudget}
                keyboardType="numeric"
                autoFocus
              />
              <TouchableOpacity
                className="ml-2 p-1"
                onPress={handleUpdateBudget}
              >
                <Ionicons name="checkmark-circle" size={24} color="#f97316" />
              </TouchableOpacity>
              <TouchableOpacity
                className="ml-2 p-1"
                onPress={() => setEditingBudget(false)}
              >
                <Ionicons name="close-circle" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
          ) : (
            <View className="flex-row items-center">
              <Text className="text-3xl font-bold text-orange-500">
                ₹{budget}
              </Text>
              <TouchableOpacity
                className="ml-2 p-1"
                onPress={() => {
                  setTempBudget(budget)
                  setEditingBudget(true)
                }}
              >
                <Ionicons name="create-outline" size={20} color="#f97316" />
              </TouchableOpacity>
            </View>
          )}

          <View className="flex-row justify-between mt-6">
            <View>
              <Text className="text-gray-500">Spent</Text>
              <Text className="text-xl font-semibold text-gray-700">
                ₹{totalExpenses}
              </Text>
            </View>
            <View>
              <Text className="text-gray-500">Remaining</Text>
              <Text
                className={`text-xl font-semibold ${
                  remaining >= 0 ? 'text-green-600' : 'text-red-500'
                }`}
              >
                ₹{remaining}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View className="h-2 bg-gray-200 rounded-full mt-4">
            <View
              className={`h-2 rounded-full ${
                budgetPercentUsed > 90
                  ? 'bg-red-500'
                  : budgetPercentUsed > 75
                  ? 'bg-yellow-500'
                  : 'bg-orange-500'
              }`}
              style={{
                width: `${Math.min(100, budgetPercentUsed)}%`,
              }}
            />
          </View>

          {/* Itinerary Planner Button */}
          <TouchableOpacity
            className="mt-4 bg-orange-500 py-2 rounded-lg items-center"
            onPress={() => setShowItineraryPlanner(true)}
          >
            <Text className="text-white font-semibold">
              Find Optimal Itinerary
            </Text>
          </TouchableOpacity>
        </View>

        {/* Warnings */}
        {warnings.length > 0 && (
          <View className="mx-4 mb-4 p-3 bg-red-100 rounded-lg">
            <Text className="font-bold text-red-700 mb-1">Budget Alerts</Text>
            {warnings.map((warning, index) => (
              <Text key={index} className="text-red-700 text-sm">
                • {warning}
              </Text>
            ))}
          </View>
        )}

        {/* Expense Categories */}
        <View className="mx-4 mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-bold text-gray-800">Expenses</Text>
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => setShowAddExpense(true)}
            >
              <Ionicons name="add-circle" size={20} color="#f97316" />
              <Text className="ml-1 text-orange-500 font-semibold">
                Add New
              </Text>
            </TouchableOpacity>
          </View>

          {expenses.map((expense) => (
            <View
              key={expense.id}
              className="bg-white p-4 rounded-lg mb-3 shadow"
            >
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center">
                    <Ionicons name={expense.icon} size={20} color="#f97316" />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-gray-800 font-medium">
                      {expense.name || expense.category}
                    </Text>
                    {getRecommendedAmount(expense.category) && (
                      <Text
                        className={`text-xs ${getStatusColor(
                          getCategoryStatus(expense.category)
                        )}`}
                      >
                        {getCategoryStatus(expense.category) === 'over'
                          ? 'Over budget'
                          : getCategoryStatus(expense.category) === 'under'
                          ? 'Under budget'
                          : 'On track'}
                      </Text>
                    )}
                  </View>
                </View>
                <View className="flex-row items-center">
                  <Text className="font-bold text-gray-800 mr-3">
                    ₹{expense.amount}
                  </Text>
                  <TouchableOpacity
                    className="mr-2"
                    onPress={() => {
                      setEditingExpense({ ...expense })
                      setShowEditExpense(true)
                    }}
                  >
                    <Ionicons name="create-outline" size={18} color="#6b7280" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteExpense(expense.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>

              <View className="flex-row justify-between mt-2 items-center">
                <View className="flex-row items-center">
                  <Text className="text-xs text-gray-500 mr-2">Priority:</Text>
                  <View
                    className={`px-2 py-0.5 rounded-full ${getPriorityColor(
                      expense.priority
                    )}`}
                  >
                    <Text className="text-xs">
                      {getPriorityLabel(expense.priority)}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center">
                  <Text className="text-xs text-gray-500 mr-2">
                    Include in itinerary:
                  </Text>
                  <Switch
                    value={expense.included}
                    onValueChange={() => toggleExpenseInclusion(expense.id)}
                    trackColor={{ false: '#d1d5db', true: '#fdba74' }}
                    thumbColor={expense.included ? '#f97316' : '#f3f4f6'}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Tips Section */}
        <View className="mx-4 mb-8 p-4 bg-orange-100 rounded-xl">
          <Text className="font-bold text-gray-800 mb-2">Budget Tips</Text>
          <Text className="text-gray-700 mb-2">
            • Look for local eateries to save on food expenses while enjoying
            authentic cuisine.
          </Text>
          <Text className="text-gray-700 mb-2">
            • Consider public transportation instead of taxis to reduce
            transportation costs.
          </Text>
          <Text className="text-gray-700">
            • Book accommodations in advance to secure better rates.
          </Text>
        </View>
      </ScrollView>

      <View className="p-4 border-t border-gray-200 bg-white">
        <TouchableOpacity
          className="bg-orange-500 py-3 rounded-lg items-center"
          onPress={() => setShowAddExpense(true)}
        >
          <Text className="text-white font-bold text-lg">Add Expense</Text>
        </TouchableOpacity>
      </View>

      {/* Add Expense Modal */}
      <Modal visible={showAddExpense} transparent={true} animationType="slide">
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-white rounded-t-xl p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-800">
                Add New Expense
              </Text>
              <TouchableOpacity onPress={() => setShowAddExpense(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <Text className="text-gray-700 mb-1">Category</Text>
            <View className="flex-row flex-wrap mb-4">
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.name}
                  className={`mr-2 mb-2 px-3 py-2 rounded-full flex-row items-center ${
                    newExpense.category === cat.name
                      ? 'bg-orange-500'
                      : 'bg-gray-200'
                  }`}
                  onPress={() =>
                    setNewExpense({
                      ...newExpense,
                      category: cat.name,
                      icon: cat.icon,
                    })
                  }
                >
                  <Ionicons
                    name={cat.icon}
                    size={16}
                    color={
                      newExpense.category === cat.name ? '#ffffff' : '#6b7280'
                    }
                  />
                  <Text
                    className={`ml-1 ${
                      newExpense.category === cat.name
                        ? 'text-white'
                        : 'text-gray-700'
                    }`}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-gray-700 mb-1">Amount (₹)</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-2 mb-4"
              value={newExpense.amount}
              onChangeText={(text) =>
                setNewExpense({ ...newExpense, amount: text })
              }
              keyboardType="numeric"
              placeholder="Enter amount"
            />

            <Text className="text-gray-700 mb-1">Priority</Text>
            <View className="flex-row mb-4">
              {priorities.map((priority) => (
                <TouchableOpacity
                  key={priority.value}
                  className={`mr-2 px-3 py-2 rounded-full ${
                    newExpense.priority === priority.value
                      ? 'bg-orange-500'
                      : 'bg-gray-200'
                  }`}
                  onPress={() =>
                    setNewExpense({ ...newExpense, priority: priority.value })
                  }
                >
                  <Text
                    className={
                      newExpense.priority === priority.value
                        ? 'text-white'
                        : 'text-gray-700'
                    }
                  >
                    {priority.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="flex-row items-center mb-4">
              <Text className="text-gray-700 mr-2">Include in itinerary:</Text>
              <Switch
                value={newExpense.included}
                onValueChange={(value) =>
                  setNewExpense({ ...newExpense, included: value })
                }
                trackColor={{ false: '#d1d5db', true: '#fdba74' }}
                thumbColor={newExpense.included ? '#f97316' : '#f3f4f6'}
              />
            </View>

            <TouchableOpacity
              className="bg-orange-500 py-3 rounded-lg items-center mb-4"
              onPress={handleAddExpense}
            >
              <Text className="text-white font-bold">Add Expense</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Expense Modal */}
      <Modal
        visible={showEditExpense && editingExpense !== null}
        transparent={true}
        animationType="slide"
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-white rounded-t-xl p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-800">
                Edit Expense
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowEditExpense(false)
                  setEditingExpense(null)
                }}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {editingExpense && (
              <>
                <Text className="text-gray-700 mb-1">Category</Text>
                <View className="flex-row flex-wrap mb-4">
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.name}
                      className={`mr-2 mb-2 px-3 py-2 rounded-full flex-row items-center ${
                        editingExpense.category === cat.name
                          ? 'bg-orange-500'
                          : 'bg-gray-200'
                      }`}
                      onPress={() =>
                        setEditingExpense({
                          ...editingExpense,
                          category: cat.name,
                          icon: cat.icon,
                        })
                      }
                    >
                      <Ionicons
                        name={cat.icon}
                        size={16}
                        color={
                          editingExpense.category === cat.name
                            ? '#ffffff'
                            : '#6b7280'
                        }
                      />
                      <Text
                        className={`ml-1 ${
                          editingExpense.category === cat.name
                            ? 'text-white'
                            : 'text-gray-700'
                        }`}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text className="text-gray-700 mb-1">Amount (₹)</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-2 mb-4"
                  value={String(editingExpense.amount)}
                  onChangeText={(text) =>
                    setEditingExpense({ ...editingExpense, amount: text })
                  }
                  keyboardType="numeric"
                  placeholder="Enter amount"
                />

                <Text className="text-gray-700 mb-1">Priority</Text>
                <View className="flex-row mb-4">
                  {priorities.map((priority) => (
                    <TouchableOpacity
                      key={priority.value}
                      className={`mr-2 px-3 py-2 rounded-full ${
                        editingExpense.priority === priority.value
                          ? 'bg-orange-500'
                          : 'bg-gray-200'
                      }`}
                      onPress={() =>
                        setEditingExpense({
                          ...editingExpense,
                          priority: priority.value,
                        })
                      }
                    >
                      <Text
                        className={
                          editingExpense.priority === priority.value
                            ? 'text-white'
                            : 'text-gray-700'
                        }
                      >
                        {priority.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View className="flex-row items-center mb-4">
                  <Text className="text-gray-700 mr-2">
                    Include in itinerary:
                  </Text>
                  <Switch
                    value={editingExpense.included}
                    onValueChange={(value) =>
                      setEditingExpense({ ...editingExpense, included: value })
                    }
                    trackColor={{ false: '#d1d5db', true: '#fdba74' }}
                    thumbColor={editingExpense.included ? '#f97316' : '#f3f4f6'}
                  />
                </View>

                <TouchableOpacity
                  className="bg-orange-500 py-3 rounded-lg items-center mb-4"
                  onPress={handleEditExpense}
                >
                  <Text className="text-white font-bold">Update Expense</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Itinerary Planner Modal */}
      <Modal
        visible={showItineraryPlanner}
        transparent={true}
        animationType="slide"
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-white rounded-t-xl p-4 h-3/4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-800">
                Find Optimal Itinerary
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowItineraryPlanner(false)
                  setRecommendedItineraries([])
                }}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {recommendedItineraries.length === 0 ? (
              <ScrollView>
                <Text className="text-gray-700 mb-4">
                  Enter your travel details to find the optimal itinerary that
                  fits your budget and preferences.
                </Text>

                <Text className="text-gray-700 mb-1">Total Budget (₹)</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-2 mb-4"
                  value={itineraryBudget}
                  onChangeText={setItineraryBudget}
                  keyboardType="numeric"
                  placeholder="Enter your total budget"
                />

                <Text className="text-gray-700 mb-1">Destination</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-2 mb-4"
                  value={destination}
                  onChangeText={setDestination}
                  placeholder="Where are you going?"
                />

                <Text className="text-gray-700 mb-1">Trip Duration (days)</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-2 mb-4"
                  value={tripDuration}
                  onChangeText={setTripDuration}
                  keyboardType="numeric"
                  placeholder="How many days?"
                />

                <Text className="text-gray-700 mb-1">Travel Style</Text>
                <View className="flex-row mb-4">
                  {travelStyles.map((style) => (
                    <TouchableOpacity
                      key={style.value}
                      className={`mr-2 px-3 py-2 rounded-full ${
                        travelStyle === style.value
                          ? 'bg-orange-500'
                          : 'bg-gray-200'
                      }`}
                      onPress={() => setTravelStyle(style.value)}
                    >
                      <Text
                        className={
                          travelStyle === style.value
                            ? 'text-white'
                            : 'text-gray-700'
                        }
                      >
                        {style.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text className="text-gray-700 mb-4">Expense Priorities</Text>
                <Text className="text-gray-500 mb-2 text-sm">
                  You have{' '}
                  {
                    expenses.filter((e) => e.priority === 'high' && e.included)
                      .length
                  }{' '}
                  must-have expenses,
                  {
                    expenses.filter(
                      (e) => e.priority === 'medium' && e.included
                    ).length
                  }{' '}
                  important expenses, and
                  {
                    expenses.filter((e) => e.priority === 'low' && e.included)
                      .length
                  }{' '}
                  nice-to-have expenses included.
                </Text>

                <TouchableOpacity
                  className="bg-orange-500 py-3 rounded-lg items-center mb-4"
                  onPress={searchItineraries}
                >
                  <Text className="text-white font-bold">Find Itineraries</Text>
                </TouchableOpacity>
              </ScrollView>
            ) : (
              <ScrollView>
                <Text className="text-gray-700 mb-4">
                  We found {recommendedItineraries.length} itineraries that
                  match your preferences:
                </Text>

                {recommendedItineraries.map((itinerary) => (
                  <TouchableOpacity
                    key={itinerary.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow"
                    onPress={() => {
                      setSelectedItinerary(itinerary)
                      setShowItineraryDetails(true)
                    }}
                  >
                    <Text className="font-bold text-lg text-gray-800">
                      {itinerary.name}
                    </Text>
                    <View className="flex-row justify-between mt-2">
                      <Text className="text-gray-700">
                        Total Cost:{' '}
                        <Text className="font-semibold">
                          ₹{itinerary.totalCost}
                        </Text>
                      </Text>
                      <Text className="text-gray-700">
                        {itinerary.duration} days
                      </Text>
                    </View>
                    <View className="flex-row mt-2 flex-wrap">
                      {itinerary.accommodations.length > 0 && (
                        <View className="bg-blue-100 rounded-full px-2 py-1 mr-2 mb-1">
                          <Text className="text-xs text-blue-700">
                            {itinerary.accommodations[0].name}
                          </Text>
                        </View>
                      )}
                      {itinerary.transportation.length > 0 && (
                        <View className="bg-green-100 rounded-full px-2 py-1 mr-2 mb-1">
                          <Text className="text-xs text-green-700">
                            {itinerary.transportation[0].name}
                          </Text>
                        </View>
                      )}
                      {itinerary.activities.length > 0 && (
                        <View className="bg-purple-100 rounded-full px-2 py-1 mr-2 mb-1">
                          <Text className="text-xs text-purple-700">
                            {itinerary.activities.length} Activities
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  className="bg-gray-200 py-3 rounded-lg items-center mb-4"
                  onPress={() => setRecommendedItineraries([])}
                >
                  <Text className="text-gray-700 font-bold">
                    Back to Search
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}

            {searchingItinerary && (
              <View className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center">
                <ActivityIndicator size="large" color="#f97316" />
                <Text className="mt-4 text-gray-700">
                  Searching for optimal itineraries...
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Itinerary Details Modal */}
      <Modal
        visible={showItineraryDetails && selectedItinerary !== null}
        transparent={true}
        animationType="slide"
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-white rounded-t-xl p-4 h-4/5">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-800">
                Itinerary Details
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowItineraryDetails(false)
                  setSelectedItinerary(null)
                }}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {selectedItinerary && (
              <ScrollView>
                <Text className="font-bold text-2xl text-gray-800 mb-2">
                  {selectedItinerary.name}
                </Text>
                <Text className="text-gray-700 mb-4">
                  Duration: {selectedItinerary.duration} days
                </Text>

                <View className="bg-orange-100 rounded-lg p-3 mb-4">
                  <Text className="font-bold text-gray-800">
                    Total Cost: ₹{selectedItinerary.totalCost}
                  </Text>
                  {itineraryBudget && (
                    <Text className="text-gray-700">
                      {Number(selectedItinerary.totalCost) <=
                      Number(itineraryBudget)
                        ? `Saves ₹${
                            Number(itineraryBudget) -
                            Number(selectedItinerary.totalCost)
                          } from your budget`
                        : `Exceeds your budget by ₹${
                            Number(selectedItinerary.totalCost) -
                            Number(itineraryBudget)
                          }`}
                    </Text>
                  )}
                </View>

                <Text className="font-bold text-lg text-gray-800 mb-2">
                  Accommodations
                </Text>
                {selectedItinerary.accommodations.map(
                  (accommodation, index) => (
                    <View
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg p-3 mb-3"
                    >
                      <Text className="font-semibold text-gray-800">
                        {accommodation.name}
                      </Text>
                      <View className="flex-row justify-between mt-1">
                        <Text className="text-gray-700">
                          {accommodation.nights} nights
                        </Text>
                        <Text className="text-gray-700">
                          ₹{accommodation.cost}
                        </Text>
                      </View>
                    </View>
                  )
                )}

                <Text className="font-bold text-lg text-gray-800 mb-2 mt-2">
                  Transportation
                </Text>
                {selectedItinerary.transportation.map((transport, index) => (
                  <View
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-3 mb-3"
                  >
                    <Text className="font-semibold text-gray-800">
                      {transport.name}
                    </Text>
                    <View className="flex-row justify-between mt-1">
                      <Text className="text-gray-700">Local transport</Text>
                      <Text className="text-gray-700">₹{transport.cost}</Text>
                    </View>
                  </View>
                ))}

                <Text className="font-bold text-lg text-gray-800 mb-2 mt-2">
                  Food
                </Text>
                {selectedItinerary.meals.map((meal, index) => (
                  <View
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-3 mb-3"
                  >
                    <Text className="font-semibold text-gray-800">
                      {meal.name}
                    </Text>
                    <View className="flex-row justify-between mt-1">
                      <Text className="text-gray-700">{meal.days} days</Text>
                      <Text className="text-gray-700">₹{meal.cost}</Text>
                    </View>
                  </View>
                ))}

                <Text className="font-bold text-lg text-gray-800 mb-2 mt-2">
                  Activities
                </Text>
                {selectedItinerary.activities.map((activity, index) => (
                  <View
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-3 mb-3"
                  >
                    <Text className="font-semibold text-gray-800">
                      {activity.name}
                    </Text>
                    <View className="flex-row justify-between mt-1">
                      <Text className="text-gray-700">Day {activity.day}</Text>
                      <Text className="text-gray-700">₹{activity.cost}</Text>
                    </View>
                  </View>
                ))}

                <View className="flex-row mt-4 mb-8">
                  <TouchableOpacity
                    className="bg-orange-500 py-3 rounded-lg items-center flex-1 mr-2"
                    onPress={() => applyItinerary(selectedItinerary)}
                  >
                    <Text className="text-white font-bold">
                      Apply to Budget
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="bg-gray-200 py-3 rounded-lg items-center flex-1 ml-2"
                    onPress={() => {
                      setShowItineraryDetails(false)
                      setSelectedItinerary(null)
                    }}
                  >
                    <Text className="text-gray-700 font-bold">Back</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

export default BudgetPlannerScreen
