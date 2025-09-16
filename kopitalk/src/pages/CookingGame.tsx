import React, { useState, useEffect } from 'react'
import { ArrowLeft, ChefHat, Clock, Users, Star, CheckCircle, Play, Pause } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Recipe {
  id: string
  name: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  duration: number
  serves: number
  ingredients: string[]
  steps: string[]
  tips: string[]
  cultural_note: string
}

const CookingGame: React.FC = () => {
  const navigate = useNavigate()
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [timer, setTimer] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([])

  const recipes: Recipe[] = [
    {
      id: '1',
      name: 'Hainanese Chicken Rice',
      difficulty: 'Medium',
      duration: 45,
      serves: 4,
      ingredients: [
        '1 whole chicken (1.2kg)',
        '2 cups jasmine rice',
        '3 cloves garlic, minced',
        '2 inches ginger, sliced',
        '2 pandan leaves',
        '1 cucumber, sliced',
        'Chicken stock',
        'Soy sauce, chili sauce'
      ],
      steps: [
        'Boil chicken with ginger and pandan leaves for 30 minutes',
        'Remove chicken and reserve stock for rice',
        'Rinse rice and fry with garlic until fragrant',
        'Add chicken stock to rice and cook',
        'Shred chicken and serve with rice',
        'Prepare chili and ginger sauces',
        'Plate with cucumber slices'
      ],
      tips: [
        'Use ice water bath to make chicken skin smooth',
        'Don\'t overcook the rice - it should be fragrant and fluffy',
        'The ginger sauce should be balanced - not too salty'
      ],
      cultural_note: 'This iconic dish represents the Hainanese community\'s adaptation to local tastes in Singapore. Each hawker has their own secret recipe!'
    },
    {
      id: '2',
      name: 'Laksa',
      difficulty: 'Hard',
      duration: 60,
      serves: 4,
      ingredients: [
        '400g fresh laksa noodles',
        '200ml coconut milk',
        '500ml chicken/seafood stock',
        '200g prawns',
        '2 fish cakes, sliced',
        'Bean sprouts',
        'Laksa paste',
        'Hard-boiled eggs',
        'Coriander leaves'
      ],
      steps: [
        'Prepare laksa paste by blending spices',
        'Cook paste in oil until fragrant',
        'Add stock and bring to boil',
        'Add coconut milk and simmer',
        'Cook prawns and fish cake',
        'Blanch noodles and bean sprouts',
        'Assemble bowls with toppings'
      ],
      tips: [
        'The laksa paste is key - don\'t rush this step',
        'Balance coconut milk - too much makes it cloying',
        'Fresh prawns make all the difference'
      ],
      cultural_note: 'Laksa represents the beautiful fusion of Chinese noodles with Malay spice paste, creating Singapore\'s unique Peranakan cuisine.'
    },
    {
      id: '3',
      name: 'Kaya Toast',
      difficulty: 'Easy',
      duration: 15,
      serves: 2,
      ingredients: [
        '4 slices bread',
        '3 tbsp kaya (coconut jam)',
        '2 tbsp butter',
        'Pinch of salt',
        '2 soft-boiled eggs',
        'White pepper',
        'Dark soy sauce'
      ],
      steps: [
        'Toast bread until golden brown',
        'Spread butter on hot toast',
        'Add generous layer of kaya',
        'Prepare soft-boiled eggs (6-7 minutes)',
        'Crack eggs into bowl',
        'Add soy sauce and pepper',
        'Serve together as kopitiam set'
      ],
      tips: [
        'Toast should be crispy outside, soft inside',
        'Don\'t skimp on the butter and kaya',
        'Eggs should be runny - perfect for dipping'
      ],
      cultural_note: 'This quintessential kopitiam breakfast connects generations. Many grandparents have fond memories of enjoying this with kopi-o!'
    }
  ]

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isActive && selectedRecipe) {
      interval = setInterval(() => {
        setTimer(timer => timer + 1)
      }, 1000)
    } else if (!isActive && timer !== 0) {
      if (interval) clearInterval(interval)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timer, selectedRecipe])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'  
      case 'Hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const completeStep = () => {
    if (selectedRecipe && currentStep < selectedRecipe.steps.length - 1) {
      const newCompleted = [...completedSteps]
      newCompleted[currentStep] = true
      setCompletedSteps(newCompleted)
      setCurrentStep(currentStep + 1)
    } else if (selectedRecipe && currentStep === selectedRecipe.steps.length - 1) {
      const newCompleted = [...completedSteps]
      newCompleted[currentStep] = true
      setCompletedSteps(newCompleted)
      setIsActive(false)
    }
  }

  const startCooking = () => {
    if (selectedRecipe) {
      setCompletedSteps(new Array(selectedRecipe.steps.length).fill(false))
      setCurrentStep(0)
      setTimer(0)
      setIsActive(true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Family Cooking</h1>
            <p className="text-gray-600">Learn traditional Singapore recipes together</p>
          </div>
        </div>

        {!selectedRecipe ? (
          <div>
            {/* Recipe Selection */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Choose a Recipe</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    onClick={() => setSelectedRecipe(recipe)}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">{recipe.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                        {recipe.difficulty}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        {recipe.duration} minutes
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        Serves {recipe.serves}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">{recipe.cultural_note}</p>

                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map((star) => (
                        <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                      <span className="text-sm text-gray-500 ml-2">Family Favorite</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recipe Info & Steps */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedRecipe.name}</h2>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {selectedRecipe.duration} min
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        Serves {selectedRecipe.serves}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedRecipe.difficulty)}`}>
                        {selectedRecipe.difficulty}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedRecipe(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-orange-50 rounded-lg p-4 mb-6">
                  <p className="text-orange-800 text-sm">{selectedRecipe.cultural_note}</p>
                </div>

                {!isActive && completedSteps.length === 0 && (
                  <button
                    onClick={startCooking}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    <ChefHat className="w-5 h-5" />
                    Start Cooking
                  </button>
                )}
              </div>

              {/* Cooking Steps */}
              {completedSteps.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Cooking Steps</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Timer:</span>
                      <span className="font-mono font-semibold text-orange-600">{formatTime(timer)}</span>
                      <button
                        onClick={() => setIsActive(!isActive)}
                        className="ml-2 p-1 hover:bg-gray-100 rounded"
                      >
                        {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {selectedRecipe.steps.map((step, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          index === currentStep && !completedSteps[index]
                            ? 'border-orange-300 bg-orange-50'
                            : completedSteps[index]
                            ? 'border-green-300 bg-green-50'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                            completedSteps[index]
                              ? 'bg-green-500 text-white'
                              : index === currentStep
                              ? 'bg-orange-500 text-white'
                              : 'bg-gray-300 text-gray-600'
                          }`}>
                            {completedSteps[index] ? <CheckCircle className="w-4 h-4" /> : index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-800">{step}</p>
                            {index === currentStep && !completedSteps[index] && (
                              <button
                                onClick={completeStep}
                                className="mt-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-sm font-medium"
                              >
                                Complete Step
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Ingredients */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingredients</h3>
                <div className="space-y-2">
                  {selectedRecipe.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full" />
                      <span className="text-sm text-gray-700">{ingredient}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pro Tips</h3>
                <div className="space-y-3">
                  {selectedRecipe.tips.map((tip, index) => (
                    <div key={index} className="bg-yellow-50 p-3 rounded-lg">
                      <p className="text-sm text-yellow-800">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CookingGame
