import Promise from 'bluebird'
import EventEmitter from 'events'
import ExpressionParser from 'jsep'

const IDENTIFIER = 'Identifier'
const CALL_EXPR = 'CallExpression'
const BINARY_EXPR = 'BinaryExpression'
const LITERAL = 'Literal'

export default class ExcelExpressionParser extends EventEmitter {
  parse (formula) {
    return this.exec(ExpressionParser(formula))
  }

  exec (expr) {
    return new Promise((resolve, reject) => {
      switch (expr.type) {
        case IDENTIFIER:
          this.emit('getIdentifierValue', expr.name, (result) => {
            resolve(result)
          })
          break
        case CALL_EXPR:
          let callExpArgs = []
          for (let arg of expr.arguments) {
            callExpArgs.push(this.exec(arg))
          }
          Promise.all(callExpArgs).then((results) => {
            resolve(results)
          })
          break
        case BINARY_EXPR:
          let binaryExpArgs = []
          binaryExpArgs.push(this.exec(expr.left))
          binaryExpArgs.push(this.exec(expr.right))
          Promise.all(binaryExpArgs).then((results) => {
            resolve(results)
          })
          break
        case LITERAL:
          resolve(expr.raw)
          break
        default:
          throw new Error('Unknow expression type.')
      }
    })
  }
}
