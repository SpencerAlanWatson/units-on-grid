define(['EventDispatcher'], function (EventDispatcher) {
    'use strict';
    const idToObj = new Map();
    var GM = {
        GetObjById(id) {
                return idToObj.get(id);
            },
            AddObj(obj) {
                idToObj.set(obj.id, obj);
            },
            RemoveObj(id) {
                idToObj.delete(id);
            },
            selections: new Map(),
            OnClick(id, origEvent) {
                var obj = GM.GetObjById(id);
                var beingSelected = !selections.has(id);
                GM.dispatchEvent({
                    type: 'click',
                    tag: obj.tag,
                    id: id,
                    obj: obj,
                    beingSelected: beingSelected,
                    selections: GM.selections,
                    origEvent: origEvent
                });
                if (beingSelected) {
                    selections.set(id, obj);
                } else {
                    selections.delete(id);
                }
            }
    };
    EventDispatcher.prototype.apply(GM);
    return GM;
});