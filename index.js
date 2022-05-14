module.exports = function optimize(mod){
	
	let users = {}
	
	let spawned = {}
	
	let heldAbnorms = {}
	
	let friends = [/*1,*/ 2, 6, /*7,*/ 30];
	let enemies = [3, 5, 8, 28];
	let gameId = 0n;
	
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
	
	mod.hook("S_LOGIN", '*', e=>{
		gameId = e.gameId;
	})
	
	mod.hook("S_CHANGE_RELATION", '*', e=>{
		handleUser(users[e.target], e.relation)
	})
	
	
	mod.hook("S_SPAWN_USER", '*', { filter : { fake : true } }, e=>{
		if(!mod.settings.enabled) return;
		
		setTimeout(()=>{
			if(heldAbnorms[e.gameId])
				for(let abnorm of Object.keys(heldAbnorms[e.gameId]) ){
					mod.send("S_ABNORMALITY_BEGIN", '*', Object.assign(heldAbnorms[e.gameId][abnorm], { duration : Date.now() - heldAbnorms[e.gameId][abnorm].date }) )
				}
			
		}, 5)
	})
	
	
	mod.hook('S_SOCIAL', '*',  e=>{ return handleLocation(e) 					})
	mod.hook('S_USER_STATUS', '*',  e=>{return handleLocation(e) 				})
	mod.hook('S_USER_MOVETYPE', '*',  e=>{return handleLocation(e)				})
	mod.hook('S_FEARMOVE_STAGE', '*',  e=>{return handleLocation(e) 			})
	mod.hook('S_FEARMOVE_END', '*',  e=>{return handleLocation(e)				})
	mod.hook('S_USER_LOCATION', '*',  e=>{return handleLocation(e)				})
	mod.hook('S_USER_LOCATION_IN_ACTION', '*',  e=>{return handleLocation(e)	})
	mod.hook('S_CREATURE_ROTATE', '*',  e=>{return handleLocation(e)			})
	mod.hook('S_CREATURE_LIFE', '*',  e=>{return handleLocation(e)				})
	mod.hook('S_MOUNT_VEHICLE', '*',  e=>{return handleVehicle(e)				})
	mod.hook('S_UNMOUNT_VEHICLE', '*',  e=>{return handleVehicle(e)				})
	mod.hook('S_MOUNT_VEHICLE_EX', '*',  e=>{return handleVehicleEx(e)			})
	mod.hook('S_UNMOUNT_VEHICLE_EX', '*',  e=>{return handleVehicleEx(e)		})
	mod.hook('S_STICK_TO_USER_START', '*',  e=>{return handleLocation(e)		})
	mod.hook('S_STICK_TO_USER_END', '*',  e=>{return handleLocation(e)			})
	mod.hook('S_DEFEND_SUCCESS', '*',  e=>{return handleLocation(e)				})
	mod.hook('S_INSTANCE_ARROW', '*',  e=>{return handleLocation(e)				})
	mod.hook('S_ACTION_STAGE', '*',  e=>{return handleLocation(e)				})
	mod.hook('S_ACTION_END', '*',  e=>{return handleLocation(e)					})
	mod.hook('S_ABNORMALITY_BEGIN', '*',  e=>{return handleAbnorms(e, true)		})
	mod.hook('S_ABNORMALITY_END', '*',  e=>{return handleAbnorms(e, false)		})
	mod.hook('S_ABNORMALITY_REFRESH', '*',  e=>{return handleAbnorms(e, true)	})
	mod.hook('S_ABNORMALITY_RESIST', '*',  e=>{return handleLocation(e)			})
	mod.hook('S_ABNORMALITY_FAIL', '*',  e=>{return handleLocation(e)			})
	mod.hook('S_ABNORMALITY_DAMAGE_ABSORB', '*',  e=>{return handleLocation(e)	})
	mod.hook('S_SPAWN_PROJECTILE', '*',  e=>{return handleLocation(e)			})
	mod.hook('S_START_USER_PROJECTILE', '*',  e=>{return handleLocation(e)		})
	mod.hook('S_END_USER_PROJECTILE', '*',  e=>{return handleLocation(e)		})
	mod.hook('S_DESPAWN_PROJECTILE', '*',  e=>{return handleLocation(e)			})
	
	
	function handleUser(user, relation){
		
		users[user.gameId].relation = relation;
		
		if(enemies.includes(relation)){
			if(!spawned[user.gameId]){
				mod.send("S_SPAWN_USER", '*', user);
				spawned[user.gameId] = true;
			}
		}
		if(relation == 2){
			if(mod.settings.showparty){
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
			if(mod.settings.showguild){
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
			if(mod.settings.showraid){
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
		if(mod.settings.showall){
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
	
	function handleLocation(pkt){
		if(!mod.settings.enabled) return;
		if(pkt.gameId){
			if(users[pkt.gameId]){
				if(pkt.loc)
					users[pkt.gameId].loc = pkt.loc;
				if(pkt.dest) 
					if(pkt.dest.x != 0) users[pkt.gameId].loc = pkt.dest;


				return spawned[pkt.gameId];
			}
			return true;
		}
		if(pkt.target){
			if(users[pkt.target]){
				if(pkt.loc)
					users[pkt.target].loc = pkt.loc;
				if(pkt.dest) 
					if(pkt.dest.x != 0) users[pkt.target].loc = pkt.dest;


				return spawned[pkt.target];
			};
			return true;
		}
		if(pkt.source){
			if(users[pkt.source]){
				if(pkt.loc)
					users[pkt.source].loc = pkt.loc;
				if(pkt.dest) 
					if(pkt.dest.x != 0) users[pkt.source].loc = pkt.dest;


				return spawned[pkt.source];
			};
			return true;
		}
		
		return true;
	}
	
	function handleAbnorms(pkt, start){
		if(!heldAbnorms[pkt.target]) heldAbnorms[pkt.target] = {}
		
		if(start){
			if(!heldAbnorms[pkt.target][pkt.id]) heldAbnorms[pkt.target][pkt.id] = {};
			pkt.date = Date.now()
			Object.assign(heldAbnorms[pkt.target][pkt.id], pkt) ;
		}else{
			delete heldAbnorms[pkt.target][pkt.id];
		}
		if(spawned[pkt.target]) return;
		else return false;
	}
	
	function handleVehicle(pkt){
		if(pkt.gameId == gameId) return;
		if(spawned[pkt.gameId]) return;
		else{
			users[pkt.gameId].mount = pkt.id;
			return false;
		}
	}	
	
	function handleVehicleEx(pkt){
		if(pkt.target == gameId) return;
		if(spawned[pkt.target]) return;
		else{
			users[pkt.target].vehicleEx = pkt.vehicle;
			return false;
		}
	}
	
	mod.command.add('pvpopt', (opt)=>{
		
		if(opt){
			opt = opt.toLowerCase();
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