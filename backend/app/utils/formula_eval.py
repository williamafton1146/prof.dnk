import re
import ast
import operator as op

# safe operators
operators = {
    ast.Add: op.add,
    ast.Sub: op.sub,
    ast.Mult: op.mul,
    ast.Div: op.truediv,
    ast.Pow: op.pow,
    ast.USub: op.neg,
}

def eval_expr(expr, variables):
    """safe evaluation of arithmetic expression with variable names"""
    node = ast.parse(expr, mode='eval').body
    return _eval_node(node, variables)

def _eval_node(node, variables):
    if isinstance(node, ast.Constant):
        return node.value
    elif isinstance(node, ast.Name):
        if node.id not in variables:
            raise ValueError(f"Unknown variable {node.id}")
        return variables[node.id]
    elif isinstance(node, ast.BinOp):
        return operators[type(node.op)](_eval_node(node.left, variables), _eval_node(node.right, variables))
    elif isinstance(node, ast.UnaryOp):
        return operators[type(node.op)](_eval_node(node.operand, variables))
    else:
        raise TypeError(f"Unsupported operation: {type(node)}")

def compute_metrics(metrics_defs, answers):
    """metrics_defs: list of {name, expression}
       answers: dict question_id -> answer
    """
    # preprocess answers: convert to numeric where possible
    variables = {}
    for qid, ans in answers.items():
        if isinstance(ans, (int, float)):
            variables[qid] = ans
        elif isinstance(ans, str) and ans.isdigit():
            variables[qid] = int(ans)
        elif isinstance(ans, bool):
            variables[qid] = 1 if ans else 0
        else:
            # ignore non-numeric for formulas
            pass
    results = {}
    for metric in metrics_defs:
        try:
            results[metric["name"]] = eval_expr(metric["expression"], variables)
        except Exception:
            results[metric["name"]] = None
    return results