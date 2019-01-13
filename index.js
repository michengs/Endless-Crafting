//written by Bubble
//will keep crafting the last crafted item and use cures

module.exports = function EndlessCrafting(mod) {

const command = mod.command || mod.require.command;
	let enabled = false;
	let gameId;
	let craftItem;
	let pp;
	let cureId = 182439; //Normal: 181100, elite: 182439
	let cureDbid = BigInt(0);

	command.add(['制作', 'craft'], (chatLink) => {

		if (!chatLink) {
			if (enabled) { //send fake failed craft after 5 sec to unlock char
				command.message('Cancel crafting in 5 seconds.');
				setTimeout(unlock, 5000);
			}
			enabled = !enabled;
			command.message('Endless crafting module ' + (enabled?'enabled.':'disabled.'));
			return;
		}
		if (chatLink === 'unlock') {
			unlock();
		} else {
			var regexId = /#(\d*)@/;
			var regexDbid = /@(\d*)@/;
			var id = chatLink.match(regexId);
			var dbid = chatLink.match(regexDbid);
			if (id && dbid) {
				cureId = parseInt(id[1]);
				cureDbid = BigInt(parseInt(dbid[1]));
				command.message('Using pp consumable with id:' + cureId);
			} else {
				command.message('Error, not a chatLink. Please type "craft <Item>". Link the item with Ctrl+LMB.');
			}
		}
	});

	

	
	function unlock() {
		mod.toClient('S_START_PRODUCE', 3, {
			duration:0
		});
	}
	
	mod.hook('S_LOGIN', 12, event => {
		gameId = event.gameId;
	});
	
	mod.hook('S_FATIGABILITY_POINT', 3, event => {
		pp = event.fatigability;
	});
	
	mod.hook('C_START_PRODUCE', 1, event => {
		craftItem = event;
	});

	mod.hook('S_END_PRODUCE', 1, event => {
		if (!enabled || !event.success) {
			return;
		}
		if (pp < 500) {
			command.message("Using pp consumable.");
			mod.toServer('C_USE_ITEM', 3, {
				gameId: gameId,
				id: cureId,
				dbid: cureDbid,
				target: 0,
				amount: 1,
				dest: {x: 0, y: 0, z: 0},
				loc: {x: 0, y: 0, z: 0},
				w: 0,
				unk1: 0,
				unk2: 0,
				unk3: 0,
				unk4: true
			});
			mod.hookOnce('S_FATIGABILITY_POINT', 3, (e) => {
				mod.hookOnce('S_FATIGABILITY_POINT', 3, (e) => {
					if (enabled && e.fatigability > 500) {
						mod.toServer('C_START_PRODUCE', 1, craftItem);
					}
				});
			});
		} else {
			mod.toServer('C_START_PRODUCE', 1, craftItem);
		}
	});
};
