import React, { useState, useEffect } from 'react';
import { 
  Type, Image as ImageIcon, Layout, Square, MousePointer2, 
  Monitor, Tablet, Smartphone, Download, Plus, Layers, 
  Trash2, ChevronRight, ChevronDown, AlignLeft, AlignCenter, 
  AlignRight, AlignJustify, BoxSelect, Settings2, Code
} from 'lucide-react';

// --- INITIAL STATE (A beautifully designed default hero section) ---
const generateId = () => 'el_' + Math.random().toString(36).substr(2, 9);

const defaultTree = {
  id: 'root',
  tag: 'div',
  name: 'Body',
  content: '',
  styles: { minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'sans-serif', margin: '0' },
  children: [
    {
      id: generateId(),
      tag: 'section',
      name: 'Hero Section',
      content: '',
      styles: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', minHeight: '60vh' },
      children: [
        {
          id: generateId(),
          tag: 'span',
          name: 'Badge',
          content: 'NEW FEATURE',
          styles: { backgroundColor: '#dbeafe', color: '#1d4ed8', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 'bold', marginBottom: '24px', letterSpacing: '1px' },
          children: []
        },
        {
          id: generateId(),
          tag: 'h1',
          name: 'Heading',
          content: 'Build the web, visually.',
          styles: { fontSize: '48px', fontWeight: '800', color: '#0f172a', marginBottom: '16px', textAlign: 'center', lineHeight: '1.2', maxWidth: '800px' },
          children: []
        },
        {
          id: generateId(),
          tag: 'p',
          name: 'Subtitle',
          content: 'A professional-grade visual editor that outputs clean, production-ready HTML and CSS. Built entirely in a single file.',
          styles: { fontSize: '18px', color: '#64748b', marginBottom: '40px', textAlign: 'center', maxWidth: '600px', lineHeight: '1.6' },
          children: []
        },
        {
          id: generateId(),
          tag: 'div',
          name: 'Button Group',
          content: '',
          styles: { display: 'flex', gap: '16px' },
          children: [
            {
              id: generateId(),
              tag: 'button',
              name: 'Primary Button',
              content: 'Start Building',
              styles: { backgroundColor: '#3b82f6', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', border: 'none', fontSize: '16px', fontWeight: '600', cursor: 'pointer' },
              children: []
            },
            {
              id: generateId(),
              tag: 'button',
              name: 'Secondary Button',
              content: 'View Source',
              styles: { backgroundColor: '#ffffff', color: '#0f172a', padding: '12px 24px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px', fontWeight: '600', cursor: 'pointer' },
              children: []
            }
          ]
        }
      ]
    }
  ]
};

// --- MAIN APPLICATION COMPONENT ---
export default function App() {
  const [tree, setTree] = useState(defaultTree);
  const [selectedId, setSelectedId] = useState('root');
  const [hoveredId, setHoveredId] = useState(null);
  const [viewMode, setViewMode] = useState('desktop'); // desktop, tablet, mobile
  const [activeTab, setActiveTab] = useState('add'); // add, layers

  // --- HELPER: Find Node ---
  const findNode = (nodes, id) => {
    if (nodes.id === id) return nodes;
    if (nodes.children) {
      for (let child of nodes.children) {
        const found = findNode(child, id);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedNode = findNode(tree, selectedId) || tree;

  // --- HELPER: Update Node ---
  const updateNode = (node, id, updates) => {
    if (node.id === id) {
      return { ...node, ...updates };
    }
    if (node.children) {
      return { ...node, children: node.children.map(child => updateNode(child, id, updates)) };
    }
    return node;
  };

  const handleUpdateStyle = (key, value) => {
    setTree(prev => updateNode(prev, selectedId, {
      styles: { ...findNode(prev, selectedId).styles, [key]: value }
    }));
  };

  const handleUpdateContent = (value) => {
    setTree(prev => updateNode(prev, selectedId, { content: value }));
  };

  // --- HELPER: Add Node ---
  const handleAddElement = (type) => {
    const newNode = {
      id: generateId(),
      tag: type.tag,
      name: type.name,
      content: type.content || '',
      styles: { ...type.defaultStyles },
      children: type.canHaveChildren ? [] : undefined
    };

    setTree(prev => {
      // Logic: If selected is a container, add inside. Else add to root.
      const targetId = findNode(prev, selectedId)?.children ? selectedId : 'root';
      
      const insertInto = (node) => {
        if (node.id === targetId) {
          return { ...node, children: [...(node.children || []), newNode] };
        }
        if (node.children) {
          return { ...node, children: node.children.map(insertInto) };
        }
        return node;
      };
      return insertInto(prev);
    });
    
    setSelectedId(newNode.id);
  };

  // --- HELPER: Delete Node ---
  const handleDelete = () => {
    if (selectedId === 'root') return;
    setTree(prev => {
      const removeNode = (node) => {
        if (!node.children) return node;
        return {
          ...node,
          children: node.children.filter(c => c.id !== selectedId).map(removeNode)
        };
      };
      return removeNode(prev);
    });
    setSelectedId('root');
  };

  // --- COMPILER: React Tree to HTML/CSS ---
  const generateExportCode = () => {
    let cssLines = [];
    
    const compileNodeHTML = (node) => {
      const className = `el-${node.id}`;
      
      // Compile CSS
      let styleRules = [];
      for (const [key, value] of Object.entries(node.styles)) {
        if (value) {
          const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
          styleRules.push(`${cssKey}: ${value};`);
        }
      }
      if (styleRules.length > 0) {
        cssLines.push(`.${className} { ${styleRules.join(' ')} }`);
      }

      // Compile HTML
      const isSelfClosing = ['img', 'input', 'br', 'hr'].includes(node.tag);
      let html = `<${node.tag} class="${className}"`;
      
      // Special attributes
      if (node.tag === 'img' && node.content) html += ` src="${node.content}"`;
      if (node.tag === 'a' && node.content) html += ` href="#"`;
      
      if (isSelfClosing) {
        html += ' />';
      } else {
        html += '>';
        if (node.tag !== 'img' && node.content) html += node.content;
        if (node.children) {
          html += '\n' + node.children.map(c => compileNodeHTML(c)).join('\n') + '\n';
        }
        html += `</${node.tag}>`;
      }
      return html;
    };

    const bodyHtml = compileNodeHTML(tree);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Site</title>
    <style>
        /* Base Reset */
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
        
        /* Generated Styles */
${cssLines.map(l => `        ${l}`).join('\n')}
    </style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
  };

  const handleDownload = () => {
    const code = generateExportCode();
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-website.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- UI COMPONENTS ---

  const ElementsLibrary = [
    { name: 'Section', tag: 'section', icon: <Square size={18}/>, canHaveChildren: true, defaultStyles: { padding: '40px 20px', backgroundColor: '#ffffff', minHeight: '50px' } },
    { name: 'Div Block', tag: 'div', icon: <BoxSelect size={18}/>, canHaveChildren: true, defaultStyles: { padding: '20px', minHeight: '50px' } },
    { name: 'Grid Row', tag: 'div', icon: <Layout size={18}/>, canHaveChildren: true, defaultStyles: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', width: '100%' } },
    { name: 'Heading 1', tag: 'h1', icon: <Type size={18}/>, content: 'Heading', canHaveChildren: false, defaultStyles: { fontSize: '32px', fontWeight: 'bold', margin: '0 0 16px 0', color: '#111827' } },
    { name: 'Paragraph', tag: 'p', icon: <AlignLeft size={18}/>, content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', canHaveChildren: false, defaultStyles: { fontSize: '16px', color: '#4b5563', margin: '0 0 16px 0', lineHeight: '1.5' } },
    { name: 'Button', tag: 'button', icon: <MousePointer2 size={18}/>, content: 'Click Me', canHaveChildren: false, defaultStyles: { padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'inline-block' } },
    { name: 'Image', tag: 'img', icon: <ImageIcon size={18}/>, content: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop', canHaveChildren: false, defaultStyles: { maxWidth: '100%', height: 'auto', display: 'block' } },
  ];

  // The Canvas Renderer Component (Recursive)
  const CanvasNode = ({ node }) => {
    const isSelected = selectedId === node.id;
    const isHovered = hoveredId === node.id;
    const Tag = node.tag;

    const handleClick = (e) => {
      e.stopPropagation();
      setSelectedId(node.id);
    };

    const handleMouseOver = (e) => {
      e.stopPropagation();
      setHoveredId(node.id);
    };

    const handleMouseOut = (e) => {
      e.stopPropagation();
      setHoveredId(null);
    };

    // Construct styles carefully for the builder view
    let nodeStyle = { ...node.styles };
    
    // Add visual builder aids
    if (isSelected) {
      nodeStyle.outline = '2px solid #3b82f6';
      nodeStyle.outlineOffset = '-2px';
    } else if (isHovered && node.id !== 'root') {
      nodeStyle.outline = '1px dashed #93c5fd';
      nodeStyle.outlineOffset = '-1px';
    }

    // Special handling for empty containers to make them clickable in builder
    if (node.children && node.children.length === 0 && node.tag !== 'img') {
        nodeStyle.minHeight = nodeStyle.minHeight || '40px';
        if(!nodeStyle.backgroundColor && !nodeStyle.backgroundImage && node.id !== 'root') {
            nodeStyle.backgroundColor = 'rgba(243, 244, 246, 0.5)';
        }
    }

    if (node.tag === 'img') {
      return <img src={node.content} style={nodeStyle} onClick={handleClick} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut} alt="Builder Element" />;
    }

    return (
      <Tag style={nodeStyle} onClick={handleClick} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
        {node.content}
        {node.children && node.children.map(child => <CanvasNode key={child.id} node={child} />)}
      </Tag>
    );
  };

  // Layers Tree Component (Recursive)
  const LayerItem = ({ node, level = 0 }) => {
    const isSelected = selectedId === node.id;
    const [isOpen, setIsOpen] = useState(true);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div className="w-full">
        <div 
          className={`flex items-center py-1.5 px-2 text-xs cursor-pointer select-none transition-colors
            ${isSelected ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
          style={{ paddingLeft: `${(level * 12) + 8}px` }}
          onClick={() => setSelectedId(node.id)}
        >
          <div className="w-4 h-4 mr-1 flex items-center justify-center" onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}>
            {hasChildren && (isOpen ? <ChevronDown size={14}/> : <ChevronRight size={14}/>)}
          </div>
          <span className="truncate">{node.name} <span className="opacity-50 text-[10px] ml-1">{node.tag}</span></span>
        </div>
        {hasChildren && isOpen && (
          <div>
            {node.children.map(child => <LayerItem key={child.id} node={child} level={level + 1} />)}
          </div>
        )}
      </div>
    );
  };

  // --- REUSABLE CONTROL COMPONENTS ---
  const ControlGroup = ({ title, children }) => (
    <div className="border-b border-gray-800 pb-4 mb-4">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">{title}</h3>
      <div className="space-y-3 px-1">{children}</div>
    </div>
  );

  const InputControl = ({ label, value, onChange, type = "text", placeholder }) => (
    <div className="flex items-center justify-between">
      <label className="text-xs text-gray-400 w-1/3">{label}</label>
      <input 
        type={type} 
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-2/3 bg-gray-900 text-xs text-gray-100 p-1.5 rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
      />
    </div>
  );

  const SelectControl = ({ label, value, options, onChange }) => (
    <div className="flex items-center justify-between">
      <label className="text-xs text-gray-400 w-1/3">{label}</label>
      <select 
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)}
        className="w-2/3 bg-gray-900 text-xs text-gray-100 p-1.5 rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
      >
        <option value="">Default</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );

  const StyleFourWay = ({ label, stylePrefix, styles }) => (
    <div>
      <label className="text-xs text-gray-400 block mb-2">{label} (px/rem/%)</label>
      <div className="grid grid-cols-2 gap-2">
        <input placeholder="Top" value={styles[`${stylePrefix}Top`] || ''} onChange={(e) => handleUpdateStyle(`${stylePrefix}Top`, e.target.value)} className="bg-gray-900 text-xs p-1.5 border border-gray-700 rounded" />
        <input placeholder="Right" value={styles[`${stylePrefix}Right`] || ''} onChange={(e) => handleUpdateStyle(`${stylePrefix}Right`, e.target.value)} className="bg-gray-900 text-xs p-1.5 border border-gray-700 rounded" />
        <input placeholder="Bottom" value={styles[`${stylePrefix}Bottom`] || ''} onChange={(e) => handleUpdateStyle(`${stylePrefix}Bottom`, e.target.value)} className="bg-gray-900 text-xs p-1.5 border border-gray-700 rounded" />
        <input placeholder="Left" value={styles[`${stylePrefix}Left`] || ''} onChange={(e) => handleUpdateStyle(`${stylePrefix}Left`, e.target.value)} className="bg-gray-900 text-xs p-1.5 border border-gray-700 rounded" />
      </div>
    </div>
  );


  // Get canvas width based on view mode
  const getCanvasWidth = () => {
    if (viewMode === 'mobile') return '375px';
    if (viewMode === 'tablet') return '768px';
    return '100%';
  };

  return (
    <div className="flex h-screen bg-[#1e1e1e] text-gray-200 overflow-hidden font-sans">
      
      {/* LEFT SIDEBAR (Panels) */}
      <aside className="w-64 bg-[#252526] border-r border-[#333] flex flex-col">
        <div className="flex border-b border-[#333]">
          <button 
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 transition ${activeTab === 'add' ? 'text-white border-b-2 border-blue-500 bg-[#2d2d2d]' : 'text-gray-400 hover:text-gray-200'}`}
            onClick={() => setActiveTab('add')}
          >
            <Plus size={14}/> Add
          </button>
          <button 
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 transition ${activeTab === 'layers' ? 'text-white border-b-2 border-blue-500 bg-[#2d2d2d]' : 'text-gray-400 hover:text-gray-200'}`}
            onClick={() => setActiveTab('layers')}
          >
            <Layers size={14}/> Layers
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {activeTab === 'add' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-500 italic mb-2">Select an element on canvas to insert into.</p>
              <div className="grid grid-cols-2 gap-2">
                {ElementsLibrary.map((el, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleAddElement(el)}
                    className="flex flex-col items-center justify-center gap-2 p-3 bg-[#333] hover:bg-[#3f3f46] rounded-md border border-transparent hover:border-blue-500 transition text-xs"
                  >
                    <span className="text-blue-400">{el.icon}</span>
                    {el.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'layers' && (
            <div className="pt-2 -mx-4">
              <LayerItem node={tree} />
            </div>
          )}
        </div>
      </aside>

      {/* CENTER CANVAS AREA */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Top Toolbar */}
        <header className="h-14 bg-[#252526] border-b border-[#333] flex items-center justify-between px-4 shadow-sm z-10">
          <div className="flex items-center gap-2">
            <div className="flex bg-[#1e1e1e] rounded-md p-1 border border-[#333]">
              <button onClick={() => setViewMode('desktop')} className={`p-1.5 rounded ${viewMode === 'desktop' ? 'bg-[#3f3f46] text-white' : 'text-gray-400 hover:text-white'}`}><Monitor size={16}/></button>
              <button onClick={() => setViewMode('tablet')} className={`p-1.5 rounded ${viewMode === 'tablet' ? 'bg-[#3f3f46] text-white' : 'text-gray-400 hover:text-white'}`}><Tablet size={16}/></button>
              <button onClick={() => setViewMode('mobile')} className={`p-1.5 rounded ${viewMode === 'mobile' ? 'bg-[#3f3f46] text-white' : 'text-gray-400 hover:text-white'}`}><Smartphone size={16}/></button>
            </div>
            <span className="text-xs text-gray-500 ml-2">{getCanvasWidth()}</span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleDownload}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition"
            >
              <Code size={16}/> Export HTML
            </button>
          </div>
        </header>

        {/* Canvas Wrapper */}
        <div className="flex-1 overflow-auto bg-[#1e1e1e] p-4 flex justify-center custom-scrollbar" style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
          
          <div 
            className="bg-white text-black shadow-2xl transition-all duration-300 relative"
            style={{ 
              width: getCanvasWidth(), 
              minHeight: '100%',
              margin: viewMode === 'desktop' ? '0' : '0 auto',
            }}
          >
            {/* The Actual Rendered Website */}
            <CanvasNode node={tree} />
          </div>

        </div>
      </main>

      {/* RIGHT SIDEBAR (Style Editor) */}
      <aside className="w-72 bg-[#252526] border-l border-[#333] flex flex-col overflow-y-auto custom-scrollbar">
        <div className="p-4 border-b border-[#333] flex items-center justify-between sticky top-0 bg-[#252526] z-10">
          <div className="flex items-center gap-2">
            <Settings2 size={16} className="text-blue-400"/>
            <h2 className="text-sm font-semibold truncate">
              {selectedNode.name} <span className="text-gray-500 font-normal text-xs ml-1">#{selectedNode.tag}</span>
            </h2>
          </div>
          {selectedId !== 'root' && (
            <button onClick={handleDelete} className="text-red-400 hover:text-red-300 p-1" title="Delete Element">
              <Trash2 size={16}/>
            </button>
          )}
        </div>

        <div className="p-4 space-y-2">
          
          {/* CONTENT EDITING (Only if not image and has no children, or is an image) */}
          {(!selectedNode.children || selectedNode.children.length === 0 || selectedNode.tag === 'img') && selectedNode.id !== 'root' && (
            <ControlGroup title="Content">
              <div className="mb-2">
                <label className="text-xs text-gray-400 block mb-1">
                  {selectedNode.tag === 'img' ? 'Image URL' : 'Text Content'}
                </label>
                <textarea 
                  value={selectedNode.content} 
                  onChange={(e) => handleUpdateContent(e.target.value)}
                  className="w-full bg-gray-900 text-xs text-gray-100 p-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none min-h-[60px]"
                />
              </div>
            </ControlGroup>
          )}

          {/* LAYOUT PANEL */}
          <ControlGroup title="Layout">
            <SelectControl 
              label="Display" 
              value={selectedNode.styles.display} 
              onChange={(v) => handleUpdateStyle('display', v)}
              options={[
                { label: 'Block', value: 'block' },
                { label: 'Flex', value: 'flex' },
                { label: 'Grid', value: 'grid' },
                { label: 'Inline Block', value: 'inline-block' },
                { label: 'Inline', value: 'inline' },
                { label: 'None', value: 'none' },
              ]}
            />
            
            {selectedNode.styles.display === 'flex' && (
              <>
                <SelectControl 
                  label="Direction" 
                  value={selectedNode.styles.flexDirection} 
                  onChange={(v) => handleUpdateStyle('flexDirection', v)}
                  options={[ { label: 'Row', value: 'row' }, { label: 'Column', value: 'column' } ]}
                />
                <SelectControl 
                  label="Align" 
                  value={selectedNode.styles.alignItems} 
                  onChange={(v) => handleUpdateStyle('alignItems', v)}
                  options={[ { label: 'Start', value: 'flex-start' }, { label: 'Center', value: 'center' }, { label: 'End', value: 'flex-end' }, { label: 'Stretch', value: 'stretch' } ]}
                />
                <SelectControl 
                  label="Justify" 
                  value={selectedNode.styles.justifyContent} 
                  onChange={(v) => handleUpdateStyle('justifyContent', v)}
                  options={[ { label: 'Start', value: 'flex-start' }, { label: 'Center', value: 'center' }, { label: 'End', value: 'flex-end' }, { label: 'Space Between', value: 'space-between' } ]}
                />
                <InputControl label="Gap" value={selectedNode.styles.gap} onChange={(v) => handleUpdateStyle('gap', v)} placeholder="16px" />
              </>
            )}

            {selectedNode.styles.display === 'grid' && (
              <>
                <InputControl label="Columns" value={selectedNode.styles.gridTemplateColumns} onChange={(v) => handleUpdateStyle('gridTemplateColumns', v)} placeholder="repeat(2, 1fr)" />
                <InputControl label="Gap" value={selectedNode.styles.gap} onChange={(v) => handleUpdateStyle('gap', v)} placeholder="20px" />
              </>
            )}
          </ControlGroup>

          {/* SIZING PANEL */}
          <ControlGroup title="Sizing">
             <InputControl label="Width" value={selectedNode.styles.width} onChange={(v) => handleUpdateStyle('width', v)} placeholder="100% or px" />
             <InputControl label="Height" value={selectedNode.styles.height} onChange={(v) => handleUpdateStyle('height', v)} placeholder="auto" />
             <InputControl label="Min Height" value={selectedNode.styles.minHeight} onChange={(v) => handleUpdateStyle('minHeight', v)} placeholder="e.g. 50px" />
             <InputControl label="Max Width" value={selectedNode.styles.maxWidth} onChange={(v) => handleUpdateStyle('maxWidth', v)} placeholder="e.g. 1200px" />
          </ControlGroup>

          {/* SPACING PANEL */}
          <ControlGroup title="Spacing">
            <StyleFourWay label="Padding (Inner)" stylePrefix="padding" styles={selectedNode.styles} />
            <div className="h-2"></div>
            <StyleFourWay label="Margin (Outer)" stylePrefix="margin" styles={selectedNode.styles} />
          </ControlGroup>

          {/* TYPOGRAPHY PANEL */}
          <ControlGroup title="Typography">
            <InputControl label="Font Size" value={selectedNode.styles.fontSize} onChange={(v) => handleUpdateStyle('fontSize', v)} placeholder="16px, 2rem..." />
            <SelectControl 
              label="Weight" 
              value={selectedNode.styles.fontWeight} 
              onChange={(v) => handleUpdateStyle('fontWeight', v)}
              options={[
                { label: 'Normal (400)', value: 'normal' },
                { label: 'Medium (500)', value: '500' },
                { label: 'Semibold (600)', value: '600' },
                { label: 'Bold (700)', value: 'bold' },
                { label: 'Extra Bold (800)', value: '800' },
              ]}
            />
            <div className="flex items-center justify-between">
               <label className="text-xs text-gray-400 w-1/3">Color</label>
               <div className="w-2/3 flex items-center gap-2">
                 <input type="color" value={selectedNode.styles.color || '#000000'} onChange={(e) => handleUpdateStyle('color', e.target.value)} className="w-6 h-6 p-0 border-0 rounded cursor-pointer" />
                 <input type="text" value={selectedNode.styles.color || ''} onChange={(e) => handleUpdateStyle('color', e.target.value)} className="flex-1 bg-gray-900 text-xs p-1 rounded border border-gray-700" placeholder="#000" />
               </div>
            </div>
            <SelectControl 
              label="Align" 
              value={selectedNode.styles.textAlign} 
              onChange={(v) => handleUpdateStyle('textAlign', v)}
              options={[ { label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' } ]}
            />
            <InputControl label="Line Height" value={selectedNode.styles.lineHeight} onChange={(v) => handleUpdateStyle('lineHeight', v)} placeholder="1.5" />
          </ControlGroup>

          {/* BACKGROUND PANEL */}
          <ControlGroup title="Background">
            <div className="flex items-center justify-between mb-2">
               <label className="text-xs text-gray-400 w-1/3">Color</label>
               <div className="w-2/3 flex items-center gap-2">
                 <input type="color" value={selectedNode.styles.backgroundColor || '#ffffff'} onChange={(e) => handleUpdateStyle('backgroundColor', e.target.value)} className="w-6 h-6 p-0 border-0 rounded cursor-pointer" />
                 <input type="text" value={selectedNode.styles.backgroundColor || ''} onChange={(e) => handleUpdateStyle('backgroundColor', e.target.value)} className="flex-1 bg-gray-900 text-xs p-1 rounded border border-gray-700" placeholder="#fff or transparent" />
               </div>
            </div>
            <InputControl label="Image URL" value={selectedNode.styles.backgroundImage} onChange={(v) => handleUpdateStyle('backgroundImage', v ? `url(${v})` : '')} placeholder="https://..." />
            {selectedNode.styles.backgroundImage && (
              <>
                <SelectControl 
                  label="Size" 
                  value={selectedNode.styles.backgroundSize} 
                  onChange={(v) => handleUpdateStyle('backgroundSize', v)}
                  options={[ { label: 'Cover', value: 'cover' }, { label: 'Contain', value: 'contain' } ]}
                />
                <SelectControl 
                  label="Position" 
                  value={selectedNode.styles.backgroundPosition} 
                  onChange={(v) => handleUpdateStyle('backgroundPosition', v)}
                  options={[ { label: 'Center', value: 'center' }, { label: 'Top', value: 'top' }, { label: 'Bottom', value: 'bottom' } ]}
                />
              </>
            )}
          </ControlGroup>

          {/* BORDERS PANEL */}
          <ControlGroup title="Borders">
             <InputControl label="Radius" value={selectedNode.styles.borderRadius} onChange={(v) => handleUpdateStyle('borderRadius', v)} placeholder="8px or 50%" />
             <InputControl label="Width" value={selectedNode.styles.borderWidth} onChange={(v) => handleUpdateStyle('borderWidth', v)} placeholder="1px" />
             <div className="flex items-center justify-between mt-2">
               <label className="text-xs text-gray-400 w-1/3">Color</label>
               <div className="w-2/3 flex items-center gap-2">
                 <input type="color" value={selectedNode.styles.borderColor || '#000000'} onChange={(e) => handleUpdateStyle('borderColor', e.target.value)} className="w-6 h-6 p-0 border-0 rounded cursor-pointer" />
                 <input type="text" value={selectedNode.styles.borderColor || ''} onChange={(e) => handleUpdateStyle('borderColor', e.target.value)} className="flex-1 bg-gray-900 text-xs p-1 rounded border border-gray-700" placeholder="#000" />
               </div>
            </div>
            <SelectControl 
              label="Style" 
              value={selectedNode.styles.borderStyle} 
              onChange={(v) => handleUpdateStyle('borderStyle', v)}
              options={[ { label: 'Solid', value: 'solid' }, { label: 'Dashed', value: 'dashed' }, { label: 'Dotted', value: 'dotted' }, { label: 'None', value: 'none' } ]}
            />
          </ControlGroup>

        </div>
      </aside>
      
      {/* Global override styles for the UI components */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6b7280; }
        /* Prevent canvas interactions from triggering default browser behaviors like drag text */
        img { user-drag: none; -webkit-user-drag: none; }
      `}} />
    </div>
  );
}


