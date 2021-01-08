import * as substates from "./substates"

export function create() {
	let state = {
		name: "menu",
		done: false,
		substate: substates.enter.create(),
		update, render
	}

	return state

	function update(view) {
		let substate = state.substate
		substate.update(view)
		if (substate.done) {
			if (substate.name === "enter") {
				state.substate = substates.select.create()
			} else if (substate.name === "select") {
				state.substate = substates.exit.create(substate.index, view.time - substate.prev.time + 1)
			} else if (substate.name === "exit") {
				state.done = true
			}
		}
	}

	function render(view) {
		state.substate.render(view)
	}
}
