// components/ui/StepIndicator.tsx
interface Step {
  number: number;
  title: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full">
      {/* Mobile version - แสดงเฉพาะ icon */}
      <div className="flex items-center justify-between mb-8 md:hidden">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                  step.number < currentStep
                    ? 'bg-green-500 text-white'
                    : step.number === currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {step.number < currentStep ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`h-px w-4 mx-1 ${
                step.number < currentStep ? 'bg-green-500' : 'bg-slate-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Desktop version - แสดงแบบเต็ม */}
      <div className="hidden md:flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  step.number < currentStep
                    ? 'bg-green-500 text-white'
                    : step.number === currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {step.number < currentStep ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              <div className="mt-2 text-center">
                <p className={`text-xs font-medium ${
                  step.number <= currentStep ? 'text-slate-900' : 'text-slate-500'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-20">
                  {step.description}
                </p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`h-px w-16 mx-4 ${
                step.number < currentStep ? 'bg-green-500' : 'bg-slate-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Current step info for mobile - แสดงข้อมูล step ปัจจุบัน */}
      <div className="md:hidden mb-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-900">
            {steps[currentStep - 1].title}
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            {steps[currentStep - 1].description}
          </p>
          <div className="mt-2">
            <span className="text-xs text-slate-500">
              ขั้นตอนที่ {currentStep} จาก {steps.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}