
import React from 'react';
import { PlayerState, Inventory, PowerType } from '../types';
import { HeartIcon, EnergyIcon, PickaxeIcon, VisionIcon } from './icons';
import { MEGA_MINE_COST, ILLUMINATE_COST } from '../constants';

interface HudProps {
  player: PlayerState;
  inventory: Inventory;
  message: string;
  onPower: (power: PowerType) => void;
  walletProfile?: string | null;
}

const Hud: React.FC<HudProps> = ({ player, inventory, message, onPower, walletProfile }) => {
  const StatBar: React.FC<{ value: number; maxValue: number; color: string; icon: React.ReactNode }> = ({ value, maxValue, color, icon }) => (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6">{icon}</div>
      <div className="w-full bg-gray-700 border-2 border-gray-900 h-6">
        <div style={{ width: `${(value / maxValue) * 100}%` }} className={`h-full ${color} transition-all duration-300`}></div>
      </div>
      <span className="w-16 text-right">{value}/{maxValue}</span>
    </div>
  );

  return (
    <div className="w-full bg-gray-800 border-4 border-gray-600 p-2 md:p-4 text-xs md:text-sm box-shadow-hard">
      {/* Wallet Profile Badge */}
      {walletProfile && (
        <div className="absolute top-0 right-0 m-2 bg-purple-900 bg-opacity-80 border border-purple-600 rounded px-2 py-1 text-xs font-mono">
          {walletProfile.slice(0, 6)}...{walletProfile.slice(-4)}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Player Stats */}
        <div className="flex flex-col gap-2">
          <StatBar value={player.health} maxValue={100} color="bg-red-500" icon={<HeartIcon className="text-red-500" />} />
          <StatBar value={player.energy} maxValue={100} color="bg-yellow-500" icon={<EnergyIcon className="text-yellow-500" />} />
        </div>

        {/* Other Stats & Inventory */}
        <div className="grid grid-cols-2 gap-4 text-center">
            <div className="flex items-center justify-center gap-2 bg-gray-900 p-2 border-2 border-black">
                <PickaxeIcon className="w-5 h-5 text-gray-400" /> 
                <span>Power: {player.miningPower}</span>
            </div>
            <div className="flex items-center justify-center gap-2 bg-gray-900 p-2 border-2 border-black">
                <VisionIcon className="w-5 h-5 text-blue-400" />
                <span>Vision: {player.visionRange}</span>
            </div>
             <div className="flex items-center justify-center gap-2 bg-gray-900 p-2 border-2 border-black">
                <span className="text-gray-200">⚫ Coal: {inventory.coal}</span>
            </div>
            <div className="flex items-center justify-center gap-2 bg-gray-900 p-2 border-2 border-black">
                <span className="text-yellow-600">⛏️ Ore: {inventory.ore}</span>
            </div>
        </div>

        {/* Message Log */}
        <div className="md:col-span-1 bg-black border-2 border-gray-900 p-3 h-16 flex items-center justify-center box-shadow-hard-inset">
          <p className="text-yellow-300">{message}</p>
        </div>
      </div>
       <div className="text-center mt-4 text-xl">
            <span className="text-gray-400">Score: </span>
            <span className="text-yellow-400">{player.score}</span>
        </div>
        {/* Powers */}
        <div className="md:col-span-3 mt-4 pt-2 border-t-2 border-gray-600 grid grid-cols-2 gap-2">
            <button
                onClick={() => onPower(PowerType.MEGA_MINE)}
                disabled={inventory.coal < MEGA_MINE_COST}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-2 border-b-2 border-orange-800 rounded text-xs disabled:bg-gray-600 disabled:border-gray-700 disabled:cursor-not-allowed"
            >
                Mega Mine ({MEGA_MINE_COST} ⚫)
            </button>
            <button
                onClick={() => onPower(PowerType.ILLUMINATE)}
                disabled={inventory.coal < ILLUMINATE_COST}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-2 border-b-2 border-cyan-800 rounded text-xs disabled:bg-gray-600 disabled:border-gray-700 disabled:cursor-not-allowed"
            >
                Illuminate ({ILLUMINATE_COST} ⚫)
            </button>
        </div>
    </div>
  );
};

export default Hud;
