import simpleeval
from typing import Dict, Any

def calculate_metrics(config: Dict[str, Any], answers: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculates metrics based on formulas defined in the test configuration.
    Uses simpleeval for safe evaluation of mathematical expressions.
    """
    metrics = {}
    formulas = config.get("formulas", {})
    # Context for evaluation includes answers and previously calculated metrics
    context = answers.copy()

    for metric_name, formula in formulas.items():
        try:
            # Add currently calculated metrics to context for inter-dependency
            eval_context = {**context, **metrics}
            result = simpleeval.simple_eval(formula, names=eval_context)
            metrics[metric_name] = result
            # Update main context for next formulas that might depend on this one
            context[metric_name] = result
        except Exception as e:
            # Log error or handle gracefully
            print(f"Error calculating metric '{metric_name}' with formula '{formula}': {e}")
            metrics[metric_name] = f"Error: {str(e)}"
    return metrics