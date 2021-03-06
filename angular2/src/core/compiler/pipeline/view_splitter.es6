import {isBlank,
  isPresent,
  BaseException} from 'angular2/src/facade/lang';
import {DOM,
  TemplateElement} from 'angular2/src/facade/dom';
import {MapWrapper,
  ListWrapper} from 'angular2/src/facade/collection';
import {Parser} from 'angular2/change_detection';
import {CompileStep} from './compile_step';
import {CompileElement} from './compile_element';
import {CompileControl} from './compile_control';
import {StringWrapper} from 'angular2/src/facade/lang';
import {$BANG} from 'angular2/src/change_detection/parser/lexer';
export class ViewSplitter extends CompileStep {
  constructor(parser, compilationUnit) {
    super();
    this._parser = parser;
    this._compilationUnit = compilationUnit;
  }
  process(parent, current, control) {
    if (isBlank(parent)) {
      current.isViewRoot = true;
    } else {
      if (current.element instanceof TemplateElement) {
        if (!current.isViewRoot) {
          var viewRoot = new CompileElement(DOM.createTemplate(''));
          var currentElement = current.element;
          var viewRootElement = viewRoot.element;
          this._moveChildNodes(currentElement.content, viewRootElement.content);
          viewRoot.isViewRoot = true;
          control.addChild(viewRoot);
        }
      } else {
        var attrs = current.attrs();
        var templateBindings = MapWrapper.get(attrs, 'template');
        var hasTemplateBinding = isPresent(templateBindings);
        MapWrapper.forEach(attrs, (attrValue, attrName) => {
          if (StringWrapper.charCodeAt(attrName, 0) == $BANG) {
            var key = StringWrapper.substring(attrName, 1);
            if (hasTemplateBinding) {
              throw new BaseException(`Only one template directive per element is allowed: ` + `${templateBindings} and ${key} cannot be used simultaneously!`);
            } else {
              templateBindings = (attrValue.length == 0) ? key : key + ' ' + attrValue;
              hasTemplateBinding = true;
            }
          }
        });
        if (hasTemplateBinding) {
          var newParent = new CompileElement(DOM.createTemplate(''));
          current.isViewRoot = true;
          this._parseTemplateBindings(templateBindings, newParent);
          this._addParentElement(current.element, newParent.element);
          control.addParent(newParent);
          current.element.remove();
        }
      }
    }
  }
  _moveChildNodes(source, target) {
    while (isPresent(source.firstChild)) {
      DOM.appendChild(target, source.firstChild);
    }
  }
  _addParentElement(currentElement, newParentElement) {
    DOM.insertBefore(currentElement, newParentElement);
    DOM.appendChild(newParentElement, currentElement);
  }
  _parseTemplateBindings(templateBindings, compileElement) {
    var bindings = this._parser.parseTemplateBindings(templateBindings, this._compilationUnit);
    for (var i = 0; i < bindings.length; i++) {
      var binding = bindings[i];
      if (binding.keyIsVar) {
        compileElement.addVariableBinding(binding.key, binding.name);
      } else if (isPresent(binding.expression)) {
        compileElement.addPropertyBinding(binding.key, binding.expression);
      } else {
        compileElement.element.setAttribute(binding.key, '');
      }
    }
  }
}
Object.defineProperty(ViewSplitter, "parameters", {get: function() {
    return [[Parser], [assert.type.any]];
  }});
Object.defineProperty(ViewSplitter.prototype.process, "parameters", {get: function() {
    return [[CompileElement], [CompileElement], [CompileControl]];
  }});
Object.defineProperty(ViewSplitter.prototype._parseTemplateBindings, "parameters", {get: function() {
    return [[assert.type.string], [CompileElement]];
  }});

//# sourceMappingURL=/Users/tbosch/projects/angular2/modules/angular2/src/core/compiler/pipeline/view_splitter.map

//# sourceMappingURL=./view_splitter.map