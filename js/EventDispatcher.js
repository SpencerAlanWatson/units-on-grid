/**
 * @author mrdoob / http://mrdoob.com/
 * Modified by RoboThePichu
 */
define([], function () {
    var EventDispatcher = function () {}

    EventDispatcher.prototype = {

        constructor: EventDispatcher,

        apply: function (object) {

            object.addEventListener = EventDispatcher.prototype.addEventListener;
            object.hasEventListener = EventDispatcher.prototype.hasEventListener;
            object.removeEventListener = EventDispatcher.prototype.removeEventListener;
            object.dispatchEvent = EventDispatcher.prototype.dispatchEvent;

        },

        addEventListener: function (type, listener, tag) {

            if (this._listeners === undefined) this._listeners = {};

            var listeners = this._listeners;

            if (listeners[type] === undefined) {

                listeners[type] = [];
            }

            if (tag === undefined) {

                if (listeners[type].indexOf(listener) === -1) {
                    listeners[type].push(listener);
                }
            } else {
                if (listeners[type][tag] === undefined) {
                    listeners[type][tag] = [];
                }
                if (listeners[type][tag].indexOf(listener) === -1) {
                    listeners[type][tag].push(listener);
                }
            }

        },

        hasEventListener: function (type, listener, tag) {

            if (this._listeners === undefined) return false;

            var listeners = this._listeners;

            if (listeners[type] !== undefined) {
                if (tag !== undefined) {
                    if (listeners[type][tag] !== undefined && listeners[type][tag].indexOf(listener) !== -1) {
                        return true;
                    }
                } else if (listeners[type].indexOf(listener) !== -1) {
                    return true;
                }


            }


            return false;

        },

        removeEventListener: function (type, listener, tag) {

            if (this._listeners === undefined) return;

            var listeners = this._listeners;
            var listenerArray = listeners[type];



            if (listenerArray !== undefined) {
                if (tag !== undefined) {
                    var tagArray = listenerArray[tag];
                    if (tagArray !== undefined) {
                        var index = tagArray.indexOf(listener);
                        if (index !== -1) {
                            tagArray.splice(index, 1);
                        }
                    }
                } else {
                    var index = listenerArray.indexOf(listener);

                    if (index !== -1) {

                        listenerArray.splice(index, 1);

                    }
                }

            }

        },

        dispatchEvent: function (event) {
            if (this._listeners === undefined) return;

            var listeners = this._listeners;
            var listenerArray = listeners[event.type];

            if (listenerArray !== undefined) {
                event.target = this;
                var array = [];
                var length = 0;

                if (event.tag !== undefined) {
                    var tagArray = listeners[event.tag];
                    length = tagArray.length;
                    for (var i = 0; i < length; ++i) {
                        array.push(tagArray[i]);
                    }

                }
                length = listenerArray.length;

                for (var i = 0; i < length; ++i) {
                    array[i] = listenerArray[i];
                }
                length = array.length;
                for (var i = 0; i < length; ++i) {

                    array[i].call(this, event);

                }

            }

        }

    };
    return EventDispatcher;
});