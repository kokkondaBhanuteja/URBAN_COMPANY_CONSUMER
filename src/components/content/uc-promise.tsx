import { Shield, Users, Wrench, CheckCircle } from "lucide-react"

const promises = [
  {
    icon: Shield,
    title: "Transparent Pricing",
    description: "No hidden charges",
  },
  {
    icon: Users,
    title: "Experts Only",
    description: "Skilled professionals",
  },
  {
    icon: Wrench,
    title: "Fully Equipped",
    description: "All tools provided",
  },
  {
    icon: CheckCircle,
    title: "100% Quality Assured",
    description: "Satisfaction guaranteed",
  },
]

export function UCPromise() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-balance">The UC Promise</h2>
          <p className="text-lg text-gray-600 text-pretty">What makes us different</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {promises.map((promise, index) => {
            const Icon = promise.icon
            return (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-uc-purple rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-balance">{promise.title}</h3>
                <p className="text-sm text-gray-600 text-pretty">{promise.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
