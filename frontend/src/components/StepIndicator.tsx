import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  onStepPress?: (step: number) => void;
}

export default function StepIndicator({ currentStep, totalSteps, onStepPress }: StepIndicatorProps) {
  const { colors } = useTheme();

  function handleStepPress(step: number) {
    if (step < currentStep && onStepPress) {
      onStepPress(step);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.stepsContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const canNavigate = stepNumber < currentStep;

          const StepComponent = canNavigate ? TouchableOpacity : View;

          return (
            <View key={stepNumber} style={styles.stepWrapper}>
              <StepComponent
                style={[
                  styles.stepCircle,
                  {
                    backgroundColor: isActive || isCompleted ? colors.primary : 'transparent',
                    borderColor: isActive || isCompleted ? colors.primary : colors.textSecondary,
                  },
                ]}
                onPress={canNavigate ? () => handleStepPress(stepNumber) : undefined}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.stepNumber,
                    {
                      color: isActive || isCompleted ? colors.white : colors.textSecondary,
                    },
                  ]}
                >
                  {stepNumber}
                </Text>
              </StepComponent>

              {stepNumber < totalSteps && (
                <View
                  style={[
                    styles.connector,
                    {
                      backgroundColor: isCompleted ? colors.primary : colors.textSecondary,
                      opacity: isCompleted ? 1 : 0.3,
                    },
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>

      <Text style={[styles.stepText, { color: colors.textSecondary }]}>
        Etapa {currentStep} de {totalSteps}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 25,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  connector: {
    width: 40,
    height: 2,
    marginHorizontal: 4,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
