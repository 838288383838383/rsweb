// Vector3 type for Luau scripts

export const Vector3Shim = `
local Vector3 = {}
Vector3.__index = Vector3

function Vector3.new(x, y, z)
  return setmetatable({X = x or 0, Y = y or 0, Z = z or 0}, Vector3)
end

function Vector3.zero()
  return Vector3.new(0, 0, 0)
end

function Vector3.one()
  return Vector3.new(1, 1, 1)
end

function Vector3.xAxis()
  return Vector3.new(1, 0, 0)
end

function Vector3.yAxis()
  return Vector3.new(0, 1, 0)
end

function Vector3.zAxis()
  return Vector3.new(0, 0, 1)
end

function Vector3.__add(a, b)
  return Vector3.new(a.X + b.X, a.Y + b.Y, a.Z + b.Z)
end

function Vector3.__sub(a, b)
  return Vector3.new(a.X - b.X, a.Y - b.Y, a.Z - b.Z)
end

function Vector3.__mul(a, b)
  if type(a) == "number" then
    return Vector3.new(a * b.X, a * b.Y, a * b.Z)
  elseif type(b) == "number" then
    return Vector3.new(a.X * b, a.Y * b, a.Z * b)
  else
    return Vector3.new(a.X * b.X, a.Y * b.Y, a.Z * b.Z)
  end
end

function Vector3.__div(a, b)
  if type(b) == "number" then
    return Vector3.new(a.X / b, a.Y / b, a.Z / b)
  end
  return Vector3.new(a.X / b.X, a.Y / b.Y, a.Z / b.Z)
end

function Vector3.__unm(a)
  return Vector3.new(-a.X, -a.Y, -a.Z)
end

function Vector3.__eq(a, b)
  return a.X == b.X and a.Y == b.Y and a.Z == b.Z
end

function Vector3:Dot(v)
  return self.X * v.X + self.Y * v.Y + self.Z * v.Z
end

function Vector3:Cross(v)
  return Vector3.new(
    self.Y * v.Z - self.Z * v.Y,
    self.Z * v.X - self.X * v.Z,
    self.X * v.Y - self.Y * v.X
  )
end

function Vector3:Magnitude()
  return math.sqrt(self.X * self.X + self.Y * self.Y + self.Z * self.Z)
end

function Vector3:Unit()
  local mag = self:Magnitude()
  if mag == 0 then return Vector3.new(0, 0, 0) end
  return self / mag
end

function Vector3:Lerp(v, t)
  return Vector3.new(
    self.X + (v.X - self.X) * t,
    self.Y + (v.Y - self.Y) * t,
    self.Z + (v.Z - self.Z) * t
  )
end

function Vector3:ToString()
  return string.format("{X=%.3f, Y=%.3f, Z=%.3f}", self.X, self.Y, self.Z)
end

Vector3.__tostring = Vector3.ToString
`;

export const CFrameShim = `
local CFrame = {}
CFrame.__index = CFrame

function CFrame.new(px, py, pz, rx, ry, rz)
  if px == nil then px = 0 end
  if py == nil then py = 0 end
  if pz == nil then pz = 0 end
  if rx == nil then rx = 0 end
  if ry == nil then ry = 0 end
  if rz == nil then rz = 0 end
  return setmetatable({Position = Vector3.new(px, py, pz), Orientation = Vector3.new(rx, ry, rz)}, CFrame)
end

function CFrame.fromPosition(pos)
  return CFrame.new(pos.X, pos.Y, pos.Z)
end

function CFrame.fromEulerAngles(rx, ry, rz)
  return CFrame.new(0, 0, 0, rx, ry, rz)
end

function CFrame:LookAt(target)
  return CFrame.new(self.Position.X, self.Position.Y, self.Position.Z)
end

function CFrame:ToObjectSpace(cf)
  return CFrame.new(
    cf.Position.X - self.Position.X,
    cf.Position.Y - self.Position.Y,
    cf.Position.Z - self.Position.Z
  )
end

function CFrame:ToWorldSpace(cf)
  return CFrame.new(
    self.Position.X + cf.Position.X,
    self.Position.Y + cf.Position.Y,
    self.Position.Z + cf.Position.Z
  )
end

function CFrame:Lerp(cf, t)
  return CFrame.new(
    self.Position.X + (cf.Position.X - self.Position.X) * t,
    self.Position.Y + (cf.Position.Y - self.Position.Y) * t,
    self.Position.Z + (cf.Position.Z - self.Position.Z) * t,
    self.Orientation.X + (cf.Orientation.X - self.Orientation.X) * t,
    self.Orientation.Y + (cf.Orientation.Y - self.Orientation.Y) * t,
    self.Orientation.Z + (cf.Orientation.Z - self.Orientation.Z) * t
  )
end

function CFrame:ToString()
  return string.format("CFrame(Pos={%.3f, %.3f, %.3f}, Rot={%.3f, %.3f, %.3f})",
    self.Position.X, self.Position.Y, self.Position.Z,
    self.Orientation.X, self.Orientation.Y, self.Orientation.Z)
end

CFrame.__tostring = CFrame.ToString
`;

export const Color3Shim = `
local Color3 = {}
Color3.__index = Color3

function Color3.new(r, g, b)
  return setmetatable({R = r or 0, G = g or 0, B = b or 0}, Color3)
end

function Color3.fromRGB(r, g, b)
  return Color3.new(r / 255, g / 255, b / 255)
end

function Color3.fromHSV(h, s, v)
  local i = math.floor(h * 6)
  local f = h * 6 - i
  local p = v * (1 - s)
  local q = v * (1 - f * s)
  local t = v * (1 - (1 - f) * s)
  i = i % 6
  if i == 0 then return Color3.new(v, t, p)
  elseif i == 1 then return Color3.new(q, v, p)
  elseif i == 2 then return Color3.new(p, v, t)
  elseif i == 3 then return Color3.new(p, q, v)
  elseif i == 4 then return Color3.new(t, p, v)
  else return Color3.new(v, p, q) end
end

function Color3:Lerp(c, t)
  return Color3.new(
    self.R + (c.R - self.R) * t,
    self.G + (c.G - self.G) * t,
    self.B + (c.B - self.B) * t
  )
end

function Color3:ToString()
  return string.format("{R=%.3f, G=%.3f, B=%.3f}", self.R, self.G, self.B)
end

Color3.__tostring = Color3.ToString
`;

export const UDim2Shim = `
local UDim2 = {}
UDim2.__index = UDim2

function UDim2.new(xs, xo, ys, yo)
  return setmetatable({XScale = xs or 0, XOffset = xo or 0, YScale = ys or 0, YOffset = yo or 0}, UDim2)
end

function UDim2.fromScale(x, y)
  return UDim2.new(x, 0, y, 0)
end

function UDim2.fromOffset(x, y)
  return UDim2.new(0, x, 0, y)
end

function UDim2:ToString()
  return string.format("{XScale=%.2f, XOffset=%d, YScale=%.2f, YOffset=%d}",
    self.XScale, self.XOffset, self.YScale, self.YOffset)
end

UDim2.__tostring = UDim2.ToString
`;

export const InstanceShimCode = `
local Instance = {}

function Instance.new(className)
  local inst = {
    ClassName = className,
    Name = className,
    Parent = nil,
    Children = {},
    Properties = {},
    _signals = {},
  }

  setmetatable(inst, {
    __index = function(self, key)
      if key == "Parent" then return rawget(self, "Parent") end
      if key == "Name" then return rawget(self, "Name") end
      if key == "ClassName" then return rawget(self, "ClassName") end
      if key == "Children" then return rawget(self, "Children") end
      local props = rawget(self, "Properties")
      local prop = props[key]
      if prop ~= nil then return prop end
      return Instance[key]
    end,
    __newindex = function(self, key, value)
      if key == "Parent" then
        rawset(self, "Parent", value)
        if value and value.Children then
          table.insert(value.Children, self)
        end
        return
      end
      if key == "Name" then
        rawset(self, "Name", value)
        return
      end
      rawget(self, "Properties")[key] = value
    end,
  })

  return inst
end

function Instance:FindFirstChild(name, recursive)
  for _, child in ipairs(self.Children) do
    if child.Name == name then return child end
    if recursive then
      local found = child:FindFirstChild(name, true)
      if found then return found end
    end
  end
  return nil
end

function Instance:FindFirstChildOfClass(className)
  for _, child in ipairs(self.Children) do
    if child.ClassName == className then return child end
  end
  return nil
end

function Instance:GetChildren()
  return self.Children
end

function Instance:GetDescendants()
  local result = {}
  local function traverse(inst)
    for _, child in ipairs(inst.Children) do
      table.insert(result, child)
      traverse(child)
    end
  end
  traverse(self)
  return result
end

function Instance:Clone()
  local clone = Instance.new(self.ClassName)
  clone.Name = self.Name
  for k, v in pairs(self.Properties) do
    clone.Properties[k] = v
  end
  for _, child in ipairs(self.Children) do
    local childClone = child:Clone()
    childClone.Parent = clone
  end
  return clone
end

function Instance:Destroy()
  for _, child in ipairs(self.Children) do
    child:Destroy()
  end
  if self.Parent then
    for i, child in ipairs(self.Parent.Children) do
      if child == self then
        table.remove(self.Parent.Children, i)
        break
      end
    end
  end
  self.Parent = nil
  self.Children = {}
end

function Instance:WaitForChild(name, timeout)
  local child = self:FindFirstChild(name)
  if child then return child end
  -- In a real implementation, this would yield. For now, return nil.
  return nil
end

function Instance:GetService(name)
  -- Services are accessed through the game global
  return game:FindFirstChild(name) or Instance.new(name)
end

function Instance:SetAttribute(name, value)
  if not self.Attributes then self.Attributes = {} end
  self.Attributes[name] = value
end

function Instance:GetAttribute(name)
  if not self.Attributes then return nil end
  return self.Attributes[name]
end
`;

export const allTypeShims = [
  Vector3Shim,
  CFrameShim,
  Color3Shim,
  UDim2Shim,
  InstanceShimCode,
].join('\n');
