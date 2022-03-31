import { djinn_status } from "./Djinn";
import { GoldenSun } from "./GoldenSun";
import { GameInfo } from "./initializers/initialize_info";
import { InteractableObjects } from "./interactable_objects/InteractableObjects";
import { ItemSlot } from "./MainChar";
import { npc_movement_types } from "./NPC";
import { main_stats, permanent_status, Player } from "./Player";
import { RawStorageRecord } from "./Storage";
import { TileEvent } from "./tile_events/TileEvent";
import * as _ from "lodash";
import { Button } from "./XGamepad";
import { reverse_directions } from "./utils";

type SnapshotData = {
    storage_data: {[key_name: string]: RawStorageRecord["value"]},
    members: {
        key_name: string,
        extra_stats: Player["extra_stats"],
        permanent_status: permanent_status[],
        learnt_abilities: string[],
        items: ItemSlot[],
        djinn: {
            key_name: string,
            status: djinn_status,
            recovery_turn: number
        }[]
    }[];
    coins: number;
    random_battle_extra_rate: number;
    game_tickets: GameInfo["party_data"]["game_tickets"];
    visited_shops: string[];
    psynergies_shortcuts: {
        L: {main_char: string; ability: string};
        R: {main_char: string; ability: string};
    };
    summons: {
        key_name: string,
        available: boolean
    }[],
    artifacts_global_list: GameInfo["artifacts_global_list"],
    last_visited_town_with_sanctum: GameInfo["last_visited_town_with_sanctum"]
    map_data: {
        key_name: string,
        collision_layer: number,
        encounter_cumulator: number,
        pc: {
            direction: string,
            position: {
                x: number,
                y: number
            }
        },
        npcs: {
            key_name: string,
            index: number,
            position: {
                x: number,
                y: number
            },
            action: string,
            animation: string,
            base_collision_layer: number,
            visible: boolean,
            movement_type: npc_movement_types,
            body_in_map: boolean
        }[],
        interactable_objects: {
            key_name: string,
            index: number,
            position: {
                x: number,
                y: number
            },
            action: string,
            animation: string,
            base_collision_layer: number;
            enable: boolean;
            entangled_by_bush: boolean;
            psynergy_casted: InteractableObjects["psynergy_casted"],
            allow_jumping_over_it: boolean,
            allow_jumping_through_it: boolean,
            body_in_map: boolean
        }[],
        tile_events: {
            id: number,
            position: {
                x: number,
                y: number
            },
            active: TileEvent["active"],
            activation_directions: TileEvent["activation_directions"],
            activation_collision_layers: TileEvent["activation_collision_layers"],
            in_map: boolean
        }[]
    }
};

/** Class responsible for generating and restoring save files. */
export class Snapshot {
    private data: GoldenSun;

    constructor(data: GoldenSun) {
        this.data = data;
    }

    generate_snapshot() {
        const snapshot: SnapshotData = {
            storage_data: _.mapValues(this.data.storage.internal_storage, record => record.value),
            members: this.data.info.party_data.members.map(member => {
                return {
                    key_name: member.key_name,
                    extra_stats: {
                        [main_stats.MAX_HP]: member.extra_stats[main_stats.MAX_HP],
                        [main_stats.MAX_PP]: member.extra_stats[main_stats.MAX_PP],
                        [main_stats.ATTACK]: member.extra_stats[main_stats.ATTACK],
                        [main_stats.DEFENSE]: member.extra_stats[main_stats.DEFENSE],
                        [main_stats.AGILITY]: member.extra_stats[main_stats.AGILITY],
                        [main_stats.LUCK]: member.extra_stats[main_stats.LUCK],
                    },
                    permanent_status: [...member.permanent_status],
                    learnt_abilities: member.learnt_abilities,
                    items: member.items,
                    djinn: member.djinni.map(djinn_key_name => {
                        const djinn = this.data.info.djinni_list[djinn_key_name];
                        return {
                            key_name: djinn.key_name,
                            status: djinn.status,
                            recovery_turn: djinn.recovery_turn
                        }
                    })
                }
            }),
            coins: this.data.info.party_data.coins,
            random_battle_extra_rate: this.data.info.party_data.random_battle_extra_rate,
            game_tickets: this.data.info.party_data.game_tickets,
            visited_shops: [...this.data.info.party_data.visited_shops],
            psynergies_shortcuts: {
                L: this.data.info.party_data.psynergies_shortcuts[Button.L],
                R: this.data.info.party_data.psynergies_shortcuts[Button.R],
            },
            summons: _.map(this.data.info.summons_list, summon => {
                return {
                    key_name: summon.key_name,
                    available: summon.available
                }
            }),
            artifacts_global_list: this.data.info.artifacts_global_list,
            last_visited_town_with_sanctum: this.data.info.last_visited_town_with_sanctum,
            map_data: {
                key_name: this.data.map.key_name,
                collision_layer: this.data.map.collision_layer,
                encounter_cumulator: this.data.map.encounter_cumulator,
                pc: {
                    position: {
                        x: this.data.hero.tile_x_pos,
                        y: this.data.hero.tile_y_pos,
                    },
                    direction: reverse_directions[this.data.hero.current_direction]
                },
                npcs: this.data.map.npcs.map((npc, index) => {
                    return {
                        key_name: npc.key_name,
                        index: index,
                        position: {
                            x: npc.tile_x_pos,
                            y: npc.tile_y_pos
                        },
                        action: npc.current_action,
                        animation: npc.current_animation,
                        base_collision_layer: npc.base_collision_layer,
                        visible: npc.sprite.visible,
                        movement_type: npc.movement_type,
                        body_in_map: this.data.map.body_in_map(npc)
                    };
                }),
                interactable_objects: this.data.map.interactable_objects.map((io, index) => {
                    return {
                        key_name: io.key_name,
                        index: index,
                        position: {
                            x: io.tile_x_pos,
                            y: io.tile_y_pos
                        },
                        action: io.current_action,
                        animation: io.current_animation,
                        base_collision_layer: io.base_collision_layer,
                        enable: io.enable,
                        entangled_by_bush: io.entangled_by_bush,
                        psynergy_casted: io.psynergy_casted,
                        allow_jumping_over_it: io.allow_jumping_over_it,
                        allow_jumping_through_it: io.allow_jumping_through_it,
                        body_in_map: this.data.map.body_in_map(io)
                    };
                }),
                tile_events: _.map(TileEvent.events, event => {
                    return {
                        id: event.id,
                        position: {
                            x: event.x,
                            y: event.y
                        },
                        active: event.active,
                        activation_directions: event.activation_directions,
                        activation_collision_layers: event.activation_collision_layers,
                        in_map: this.data.map.has_event(event.id)
                    };
                })
            }
        };
        Snapshot.download_json(snapshot, "save.json");
    }

    /**
     * Downloads a json into a file.
     * @param json the js object object.
     * @param filename the destination file name.
     */
    private static download_json(json: Object, filename: string) {
        const a = document.createElement("a");
        const file = new Blob([JSON.stringify(json, null, 4)], {type: "application/json"});
        a.href = URL.createObjectURL(file);
        a.download = filename;
        a.click();
        URL.revokeObjectURL(a.href);
    }
}