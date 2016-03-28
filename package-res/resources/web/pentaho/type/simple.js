/*!
 * Copyright 2010 - 2016 Pentaho Corporation. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
define([
  "module",
  "./element",
  "../util/object",
  "../util/error",
  "../i18n!types"
], function(module, elemFactory, O, error, bundle) {

  "use strict";

  return function(context) {

    var Element = context.get(elemFactory);

    /**
     * @name pentaho.type.Simple.Type
     * @class
     * @extends pentaho.type.Element.Type
     *
     * @classDesc The type class of {@link pentaho.type.Simple}.
     */

    /**
     * @name pentaho.type.Simple
     * @class
     * @extends pentaho.type.Element
     * @amd {pentaho.type.Factory<pentaho.type.Simple>} pentaho/type/simple
     *
     * @classDesc The base abstract class of un-structured, indivisible values.
     *
     * @description Creates a simple instance.
     * @constructor
     * @param {pentaho.type.spec.USimple} [spec] A simple specification.
     */
    var Simple = Element.extend("pentaho.type.Simple", /** @lends pentaho.type.Simple# */{

      constructor: function(spec) {
        if(spec instanceof Object) {
          // A plain object?
          if(spec.constructor === Object) {
            this._configureFromObject(spec);

            // Required validation
            if(this._value == null) this.value = null;
            return;
          }

          // Another Simple? Clone or Downcast.
          if(spec instanceof Simple) {
            this._configureFromSimple(spec);
            return;
          }
        }

        this.value = spec;
      },

      /**
       * Creates a clone of the simple value.
       *
       * @return {!pentaho.type.Simple} The simple value clone.
       */
      clone: function() {
        var SimpleClass = this.constructor;

        return new SimpleClass(this);
      },

      //region value attribute
      _value: undefined,

      /**
       * Gets the underlying JavaScript value represented by the _simple_ value.
       *
       * @type !any
       * @readonly
       */
      get value() {
        return this._value;
      },

      set value(_) {
        // Value is immutable. Can only be set once.

        // Throws if nully.
        _ = this.type.toValue(_);

        if(this._value == null) {
          // First set
          this._value = _;
        } else if(this._value !== _) {
          throw error.argInvalid("value", bundle.structured.errors.value.cannotChangeValue);
        }
      },

      /**
       * Configuration alias that sets the underlying primitive value of the _simple_ value.
       * {@link pentaho.type.Simple#value}
       *
       * @ignore
       */
      set v(value) {
        this.value = value;
      }, // jshint -W078
      //endregion

      //region formatted attribute
      _formatted: null,

      /**
       * Gets or sets the formatted value of the property.
       *
       * @type ?string
       */
      get formatted() {
        return this._formatted;
      },

      set formatted(value) {
        this._formatted = nonEmptyString(value);
      },

      /**
       * Configuration alias that sets the formatted value of the property
       * {@link pentaho.type.Simple#formatted}
       *
       * @ignore
       */
      set f(value) {
        this.formatted = value;
      }, // jshint -W078
      //endregion

      /**
       * Gets the underlying primitive value of the _simple_ value.
       *
       * @return {*} The underlying value.
       */
      valueOf: function() {
        return this._value;
      },

      /**
       * Returns a string that represents the current _simple_ value.
       *
       * @return {String} The string representation.
       */
      toString: function() {
        var f = this._formatted;
        return f != null ? f : String(this._value);
      },

      /**
       * Gets the key of the simple value.
       *
       * The key of a value identifies it among values of the same concrete type.
       *
       * If two values have the same concrete type and their
       * keys are equal, then it must also be the case that
       * {@link pentaho.type.Value.Type#areEqual}
       * returns `true` when given the two values.
       * The opposite should be true as well.
       * If two values of the same concrete type have distinct keys,
       * then {@link pentaho.type.Value.Type#areEqual} should return `false`.
       *
       * The default simple value implementation, returns the result of calling
       * `toString()` on {@link pentaho.type.Simple#value}.
       *
       * @type string
       * @readonly
       */
      get key() {
        return this._value.toString();
      },

      //region configuration
      /**
       * Configures this simple value with a given configuration.
       *
       *
       * @name configure
       * @memberOf pentaho.type.Simple#
       * @param {?any} config The configuration.
       * @return {!pentaho.type.Simple} This instance.
       */

      // TODO: unify constructor, cloning and configuration code somehow?

      /**
       * Configures this value with a given _non-nully_ configuration.
       *
       * The default implementation does nothing.
       *
       * @param {any} config The configuration.
       * @override
       */
      _configure: function(config) {
        // Nothing configurable at this level
        if(config instanceof Object) {
          // A plain object?
          if(config.constructor === Object) {
            this._configureFromObject(config);
            return;
          }

          // Another Simple? Clone or Downcast.
          if(config instanceof Simple) {
            this._configureFromSimple(config);
            return;
          }
        }

        throw error.argInvalidType("config", ["Object", "pentaho.type.Simple"], typeof config);
      },

      _configureFromSimple: function(other) {
        // TODO: same simple class?
        if(other !== this) {
          // implicit "downcast" of simple values
          this.value     = other.value; // inits or ensures value is the same (and throws otherwise)
          this.formatted = other.formatted;
          // TODO: generic metadata
        }
      },

      _configureFromObject: function(config) {
        // TODO: more efficient implementation?
        this.extend(config);
      },
      //endregion

      /**
       * @inheritdoc
       */
      toSpecInScope: function(scope, requireType, keyArgs) {
        var addFormatted = !keyArgs.omitFormatted && !!this._formatted;

        // Don't need a cell/object spec?
        if(!(addFormatted || requireType))
          return this._value;

        // Need one. Ensure _ is the first property
        /*jshint laxbreak:true*/
        var spec = requireType
            ? {_: this.type.toReference(scope, keyArgs), v: this._value}
            : {v: this._value};

        if(addFormatted) spec.f = this._formatted;

        return spec;
      },

      type: /** pentaho.type.Simple.Type# */{
        id: module.id,
        isAbstract: true,
        styleClass: "pentaho-type-simple",

        //region cast method
        /**
         * Converts an external value to the type stored by the simple type
         * in its [value]{@link pentaho.type.Simple#value} property.
         *
         * This method validates that the given value is not {@link Nully}.
         * Then, it delegates the actual conversion to the [cast]{@link pentaho.type.Simple#cast} method.
         * Any user errors thrown by the `cast` method itself are thrown back to this method's caller.
         * If, however, the `cast` method returns a {@link Nully} value,
         * this method then throws an error, in its behalf,
         * informing that the given value cannot be converted to this type.
         *
         * @param {!any} value The value to convert.
         * @return {!any} The converted value.
         *
         * @throws {pentaho.lang.ArgumentRequiredError} When the given value is {@link Nully}.
         *
         * @throws {pentaho.lang.ArgumentInvalidTypeError} When the given value cannot be converted
         *  to the internal value type supported by the simple type.
         *
         * @throws {pentaho.lang.UserError} When the value cannot be converted for some reason.
         * Thrown by the [cast]{@link pentaho.type.Simple#cast} method.
         *
         * @sealed
         */
        toValue: function(value) {
          if(value == null) throw error.argRequired("value");

          value = this.cast(value);
          if(value == null)
            throw error.argInvalid("value",
                bundle.format(bundle.structured.errors.value.cannotConvertToType, [this.label]));

          return value;
        },

        /**
         * Converts a non-{@link Nully} external value to the type stored by the simple type,
         * in its [value]{@link pentaho.type.Simple#value} property.
         *
         * The given value **cannot** be a {@link Nully} value.
         *
         * When `null` is returned, it is considered that the conversion is not possible.
         * For inform on the actual reason why the conversion is not possible,
         * throw an [UserError]{@link pentaho.lang.UserError} should be used instead.
         *
         * The default implementation is the identity function.
         *
         * @param {!any} value The value to convert.
         *
         * @return {?any} The converted value or `null`, when not possible to convert.
         *
         * @throws {pentaho.lang.UserError} When the value cannot be converted for some reason.
         */
        cast: function(value) {
          return value;
        }
        //endregion
      }
    }).implement({
      type: bundle.structured.simple
    });

    return Simple;

    /**
     * Returns `null` when given a {@link Nully} value and a String otherwise
     *
     * @param value   {*} The value to be verified
     * @return {?String}
     */
    function nonEmptyString(value) {
      return value == null ? null : (String(value) || null);
    }
  };
});