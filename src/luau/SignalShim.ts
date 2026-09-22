// RBXScriptSignal shim for Luau

export const SignalShim = `
local Signal = {}
Signal.__index = Signal

function Signal.new()
  return setmetatable({_connections = {}}, Signal)
end

function Signal:Connect(fn)
  local connection = {
    Connected = true,
    Disconnect = function(self)
      self.Connected = false
      for i, conn in ipairs(self._signal._connections) do
        if conn == self then
          table.remove(self._signal._connections, i)
          break
        end
      end
    end,
    _signal = self,
    _callback = fn,
  }
  table.insert(self._connections, connection)
  return connection
end

function Signal:Fire(...)
  for _, conn in ipairs(self._connections) do
    if conn.Connected then
      conn._callback(...)
    end
  end
end

function Signal:Wait()
  -- Simplified: return immediately
  return nil
end

function Signal:Destroy()
  self._connections = {}
end

-- Task library
local task = {}

function task.wait(seconds)
  -- Simplified: no actual waiting
  return 0
end

function task.spawn(fn, ...)
  -- Run function immediately
  fn(...)
end

function task.defer(fn, ...)
  fn(...)
end

function task.delay(seconds, fn, ...)
  fn(...)
end

-- wait() global
function wait(seconds)
  return 0
end

-- typeof
local _typeof = typeof or function(v)
  if type(v) == "table" and v.ClassName then
    return v.ClassName
  end
  return type(v)
end
`;

export const allShims = SignalShim;
