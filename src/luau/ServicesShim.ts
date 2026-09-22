// Roblox Services shim for Luau execution

export const ServicesShim = `
-- Services mock
local RunService = {
  _heartbeatCallbacks = {},
  _renderCallbacks = {},
}

function RunService.Heartbeat:Connect(fn)
  table.insert(RunService._heartbeatCallbacks, fn)
  return {Disconnect = function()
    for i, cb in ipairs(RunService._heartbeatCallbacks) do
      if cb == fn then table.remove(RunService._heartbeatCallbacks, i) break end
    end
  end}
end

function RunService.RenderStepped:Connect(fn)
  table.insert(RunService._renderCallbacks, fn)
  return {Disconnect = function()
    for i, cb in ipairs(RunService._renderCallbacks) do
      if cb == fn then table.remove(RunService._renderCallbacks, i) break end
    end
  end}
end

function RunService.Heartbeat:Wait()
  -- Simplified: just return immediately
  return 0.016
end

local Players = {
  LocalPlayer = {
    Name = "Player1",
    UserId = 1,
    Character = nil,
    Backpack = Instance.new("Folder"),
  }
}

function Players:GetPlayers()
  return {Players.LocalPlayer}
end

local UserInputService = {
  _inputCallbacks = {},
}

function UserInputService.InputBegan:Connect(fn)
  table.insert(UserInputService._inputCallbacks, fn)
  return {Disconnect = function() end}
end

function UserInputService:IsKeyDown(enum)
  return false
end

local CollectionService = {
  _tags = {},
}

function CollectionService:AddTag(instance, tag)
  if not self._tags[tag] then self._tags[tag] = {} end
  table.insert(self._tags[tag], instance)
end

function CollectionService:RemoveTag(instance, tag)
  if not self._tags[tag] then return end
  for i, inst in ipairs(self._tags[tag]) do
    if inst == instance then table.remove(self._tags[tag], i) break end
  end
end

function CollectionService:GetTagged(tag)
  return self._tags[tag] or {}
end

function CollectionService:HasTag(instance, tag)
  if not self._tags[tag] then return false end
  for _, inst in ipairs(self._tags[tag]) do
    if inst == instance then return true end
  end
  return false
end

local TweenService = {}

function TweenService:Create(instance, tweenInfo, goals)
  -- Simplified: apply goals immediately
  for k, v in pairs(goals) do
    instance[k] = v
  end
  return {Play = function() end, Cancel = function() end}
end

local DataStoreService = {
  _stores = {},
}

function DataStoreService:GetDataStore(name)
  if not self._stores[name] then
    self._stores[name] = {data = {}}
  end
  local store = self._stores[name]
  return {
    GetAsync = function(_, key) return store.data[key] end,
    SetAsync = function(_, key, value) store.data[key] = value end,
    RemoveAsync = function(_, key) store.data[key] = nil end,
  }
end

local HttpService = {}

function HttpService:GetAsync(url)
  return '{"status": "mock"}'
end

function HttpService:PostAsync(url, data)
  return '{"status": "ok"}'
end

function HttpService:JSONEncode(t)
  return "{}"
end

function HttpService:JSONDecode(s)
  return {}
end

local Lighting = {
  Ambient = Color3.new(0.5, 0.5, 0.5),
  Brightness = 1,
  ClockTime = 14,
  ColorShift_Bottom = Color3.new(0, 0, 0),
  ColorShift_Top = Color3.new(0, 0, 0),
  EnvironmentDiffuseScale = 1,
  EnvironmentSpecularScale = 1,
  GlobalShadows = true,
  OutdoorAmbient = Color3.new(0.5, 0.5, 0.5),
  ShadowSoftness = 0.2,
  TimeOfDay = "14:00:00",
}

local SoundService = {}

local StarterGui = {}
`;

export const GameShim = `
-- game global (root DataModel)
game = Instance.new("DataModel")
game.Name = "DataModel"

-- Create services
local workspace = Instance.new("Workspace")
workspace.Name = "Workspace"
workspace.Parent = game

local lighting = Instance.new("Folder")
lighting.Name = "Lighting"
lighting.Parent = game

local players = Instance.new("Folder")
players.Name = "Players"
players.Parent = game

local replicatedStorage = Instance.new("Folder")
replicatedStorage.Name = "ReplicatedStorage"
replicatedStorage.Parent = game

local serverScriptService = Instance.new("Folder")
serverScriptService.Name = "ServerScriptService"
serverScriptService.Parent = game

local starterGui = Instance.new("Folder")
starterGui.Name = "StarterGui"
starterGui.Parent = game

-- Aliases
workspace = game:FindFirstChild("Workspace")
`;
