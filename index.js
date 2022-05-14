module.exports = function optimize(mod){
	
	let users = {}
	
	let spawned = {}
	
	let friends = [/*1,*/ 2, 6, /*7,*/ 30];
	let enemies = [3, 5, 8, 28];
	
	mod.hook("S_SPAWN_USER", '*', e=>{
		users[e.gameId] = e;
		spawned[e.gameId] = false;
		if(!mod.settings.enabled) return;
		handleUser(e, e.relation)
		return false;
	})
	mod.hook("S_DESPAWN_USER", '*', e=>{
		delete users[e.gameId];
	})
	
	mod.hook("S_CHANGE_RELATION", '*', e=>{
		handleUser(users[e.target], e.relation)
	})
	
	
	function handleUser(user, relation){
		if(enemies.includes(relation)){
			if(!spawned[user.gameId]){
				mod.send("S_SPAWN_USER", '*', user);
				spawned[user.gameId] = true;
			}
		}
		if(relation == 2){
			if(mod.settings.showParty){
				if(!spawned[user.gameId]){
					mod.send("S_SPAWN_USER", '*', user);
					spawned[user.gameId] = true;
				}
			}else{
				if(spawned[user.gameId]){
					mod.send("S_DESPAWN_USER", '*', user);
					spawned[user.gameId] = false;
				}
			}
			return;
		}
		if(relation == 6){
			if(mod.settings.showGuild){
				if(!spawned[user.gameId]){
					mod.send("S_SPAWN_USER", '*', user);
					spawned[user.gameId] = true;
				}
			}else{
				if(spawned[user.gameId]){
					mod.send("S_DESPAWN_USER", '*', user);
					spawned[user.gameId] = false;
				}
			}
			return;
		}
		if(relation == 30){
			if(mod.settings.showRaid){
				if(!spawned[user.gameId]){
					mod.send("S_SPAWN_USER", '*', user);
					spawned[user.gameId] = true;
				}
			}else{
				if(spawned[user.gameId]){
					mod.send("S_DESPAWN_USER", '*', user);
					spawned[user.gameId] = false;
				}
			}
			return;
		}
		if(mod.settings.showAll){
				if(!spawned[user.gameId]){
					mod.send("S_SPAWN_USER", '*', user);
					spawned[user.gameId] = true;
				}
		} else {
			if(spawned[user.gameId] && !enemies.includes(relation) && !friends.includes(relation) ){
				mod.send("S_DESPAWN_USER", '*', user);
				spawned[user.gameId] = false;
			}
		}
	}
	
	mod.command.add('pvpopt', (opt)=>{
		
		if(opt){
			if(mod.settings[opt] != undefined){
				mod.settings[opt] = !mod.settings[opt]
				mod.command.message("PvP Optimizer [" + opt + "] " + (mod.settings[opt]?"Enabled":"Disabled") + ".");
			}
			else if(mod.settings[opt] == undefined){
				mod.command.message("Command " + opt + " not found.");
			}
		}else{
			mod.settings.enabled = !mod.settings.enabled;
			mod.command.message("PvP Optimizer : " + (mod.settings.enabled?"Enabled":"Disabled") + ".");
		}
		if(mod.settings.enabled)
			for(let key of Object.keys(users) ){
				handleUser(users[key], users[key].relation)
			}
		if(!mod.settings.enabled)
			for(let key of Object.keys(users) ){
				if(!spawned[users[key].gameId]){
					mod.send("S_SPAWN_USER", '*', users[key]);
					spawned[users[key].gameId] = true;
				}
			}
	})
}