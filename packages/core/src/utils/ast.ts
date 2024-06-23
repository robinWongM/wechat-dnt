import type { Node, Property, Literal, ObjectExpression } from 'estree';

// Helper function to pick a property from an AST node
function pick(node: ObjectExpression, propertyName: string) {
  return node.properties.find((item): item is Property =>
    item.type === 'Property' &&
    item.key.type === 'Literal' &&
    (propertyName === '*' || item.key.value === propertyName)
  )?.value;
}

// Helper function to safely access nested properties
function pickNested(node: ObjectExpression, ...propertyNames: string[]): Literal | undefined {
  let currentNode: any = node;
  for (const prop of propertyNames) {
    currentNode = pick(currentNode, prop);
    if (!currentNode) {
      return undefined;
    }
  }
  return currentNode;
}

// Helper function to safely get the value of a literal
function getLiteralValue(node: Node | undefined) {
  if (node && node.type === 'Literal') {
    return (node as Literal).value;
  }
  return undefined;
}

// Helper function to safely get properties of an ObjectExpression
function getObjectProperties(node: Node | undefined) {
  if (node && node.type === 'ObjectExpression') {
    return (node as ObjectExpression).properties;
  }
  return undefined;
}

export { pick, pickNested, getLiteralValue, getObjectProperties };
