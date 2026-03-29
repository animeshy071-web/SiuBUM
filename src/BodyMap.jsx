import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, TrendingUp } from 'lucide-react';
import { BODY_FRONT, BODY_BACK } from './bodyData.js';
import EXERCISE_DB from './data/exercises.json';
import { getExercisePerf } from './performanceStore';

// ─── Equipment keys ───────────────────────────────────────────────────────────
export const EQUIPMENT_OPTIONS = ['dumbbell', 'cable', 'machine', 'bodyweight'];

// ─── Slug → exercise-DB muscle name ──────────────────────────────────────────
const SLUG_TO_MUSCLE = {
    chest: 'Chest',
    abs: 'Abs',
    obliques: 'Abs',
    deltoids: 'Shoulders',
    biceps: 'Biceps',
    forearm: 'Forearms',
    triceps: 'Triceps',
    trapezius: 'Traps',
    'upper-back': 'Upper Back',
    lats: 'Lats',
    'lower-back': 'Lower Back',
    gluteal: 'Glutes',
    quadriceps: 'Quads',
    hamstring: 'Hamstrings',
    calves: 'Calves',
};

// Slugs that exist in the asset but are purely decorative (not selectable)
const NON_INTERACTIVE = new Set([
    'head', 'hair', 'neck', 'hands', 'feet', 'ankles', 'knees', 'tibialis', 'adductors',
]);

// ─── Asset-based SVG body renderer ───────────────────────────────────────────
// viewBox for front: "0 0 724 1448"   back: "724 0 724 1448"
function AssetBodySVG({ bodyParts, isFront, selectedMuscle, onSelect, theme, accent }) {
    const viewBox = isFront ? '0 0 724 1448' : '724 0 724 1448';
    const [hoveredSlug, setHoveredSlug] = useState(null);
    const filterId = isFront ? 'fireGlowFront' : 'fireGlowBack';

    return (
        <svg
            viewBox={viewBox}
            className="w-full h-full"
            style={{ overflow: 'visible' }}
        >
            {/* ── Fire-glow SVG filter ── */}
            <defs>
                <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                    {/* Inner tight glow */}
                    <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blur1" />
                    <feFlood floodColor={accent} floodOpacity="0.7" result="color1" />
                    <feComposite in="color1" in2="blur1" operator="in" result="glow1" />

                    {/* Outer soft glow */}
                    <feGaussianBlur in="SourceAlpha" stdDeviation="14" result="blur2" />
                    <feFlood floodColor={accent} floodOpacity="0.35" result="color2" />
                    <feComposite in="color2" in2="blur2" operator="in" result="glow2" />

                    {/* Stack: outer glow → inner glow → original shape */}
                    <feMerge>
                        <feMergeNode in="glow2" />
                        <feMergeNode in="glow1" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {bodyParts.map((part) => {
                const muscleName = SLUG_TO_MUSCLE[part.slug];
                const interactive = muscleName && !NON_INTERACTIVE.has(part.slug);
                const isActive = interactive && selectedMuscle === muscleName;
                const isHovered = interactive && hoveredSlug === part.slug;

                const showGlow = isHovered;

                const fill = isHovered ? accent : theme.muscleFill;
                const stroke = interactive
                    ? (isHovered ? accent : (isActive ? accent : `${accent}45`))
                    : 'none';
                const strokeWidth = isHovered ? 1.5 : (isActive ? 1.5 : 0.8);
                const opacity = NON_INTERACTIVE.has(part.slug)
                    ? 0.55
                    : (isHovered ? 0.9 : (isActive ? 0.85 : 0.8));
                const cursor = interactive ? 'pointer' : 'default';

                const handleClick = interactive
                    ? () => onSelect(muscleName)
                    : undefined;

                const handleMouseEnter = interactive
                    ? () => setHoveredSlug(part.slug)
                    : undefined;

                const handleMouseLeave = interactive
                    ? () => setHoveredSlug((prev) => (prev === part.slug ? null : prev))
                    : undefined;

                const allPaths = [
                    ...(part.path?.common || []),
                    ...(part.path?.left || []),
                    ...(part.path?.right || []),
                ];

                return allPaths.map((d, i) => (
                    <path
                        key={`${part.slug}-${i}`}
                        d={d}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={strokeWidth}
                        opacity={opacity}
                        filter={showGlow ? `url(#${filterId})` : 'none'}
                        className={showGlow ? 'muscle-hover-glow' : ''}
                        style={{
                            cursor,
                            transition: 'fill 0.18s, opacity 0.18s, filter 0.22s, stroke-width 0.18s',
                        }}
                        onClick={handleClick}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        onTouchStart={handleMouseEnter}
                    />
                ));
            })}
        </svg>
    );
}

// ─── BodySVG wrapper (keeps same external interface as before) ────────────────
function BodySVG({ isFront, selectedMuscle, onSelect, theme, accent }) {
    const bodyParts = isFront ? BODY_FRONT : BODY_BACK;
    return (
        <AssetBodySVG
            bodyParts={bodyParts}
            isFront={isFront}
            selectedMuscle={selectedMuscle}
            onSelect={onSelect}
            theme={theme}
            accent={accent}
        />
    );
}



// ─── Front Muscle Groups ──────────────────────────────────────────────────────
const FRONT_MUSCLES = [
    {
        id: 'Shoulders',
        label: 'Shoulders',
        labelPos: { x: 100, y: 86 },
        // Left & right anterior deltoid
        paths: [
            // Left deltoid (viewer's left = body's right)
            'M 68,78 C 56,76 46,80 42,90 C 38,100 42,114 50,118 C 56,122 64,118 68,110 C 72,102 74,90 68,78 Z',
            // Right deltoid
            'M 132,78 C 144,76 154,80 158,90 C 162,100 158,114 150,118 C 144,122 136,118 132,110 C 128,102 126,90 132,78 Z',
        ],
    },
    {
        id: 'Chest',
        label: 'Chest',
        labelPos: { x: 100, y: 126 },
        // Pectoralis major — two teardrop shapes either side of sternum
        paths: [
            // Left pec
            'M 70,98 C 66,104 64,114 66,126 C 68,136 74,144 82,148 C 90,152 98,150 100,146 L 100,118 C 92,114 80,108 70,98 Z',
            // Right pec
            'M 130,98 C 134,104 136,114 134,126 C 132,136 126,144 118,148 C 110,152 102,150 100,146 L 100,118 C 108,114 120,108 130,98 Z',
        ],
    },
    {
        id: 'Abs',
        label: 'Abs',
        labelPos: { x: 100, y: 184 },
        // Six rectus abdominis segments + oblique slivers
        paths: [
            // Row 1
            'M 88,150 C 88,150 94,150 100,150 L 100,162 C 94,163 88,162 88,162 Z',
            'M 100,150 C 106,150 112,150 112,150 L 112,162 C 106,163 100,162 100,162 Z',
            // Row 2
            'M 87,165 C 87,165 94,166 100,166 L 100,178 C 94,179 87,178 87,178 Z',
            'M 100,166 C 106,166 113,165 113,165 L 113,178 C 106,179 100,178 100,178 Z',
            // Row 3
            'M 88,181 C 88,181 94,182 100,182 L 100,194 C 94,195 88,194 88,194 Z',
            'M 100,182 C 106,182 112,181 112,181 L 112,194 C 106,195 100,194 100,194 Z',
            // External obliques (sides)
            'M 80,152 C 76,158 74,172 76,186 C 78,196 82,202 88,202 L 88,194 C 84,192 82,180 82,168 C 82,160 80,154 80,152 Z',
            'M 120,152 C 124,158 126,172 124,186 C 122,196 118,202 112,202 L 112,194 C 116,192 118,180 118,168 C 118,160 120,154 120,152 Z',
        ],
    },
    {
        id: 'Biceps',
        label: 'Biceps',
        labelPos: { x: 100, y: 163 },
        // Upper arm anterior
        paths: [
            // Left bicep
            'M 44,120 C 38,122 32,132 30,146 C 28,158 32,170 40,172 C 46,174 52,168 54,158 C 56,148 54,134 48,124 Z',
            // Right bicep
            'M 156,120 C 162,122 168,132 170,146 C 172,158 168,170 160,172 C 154,174 148,168 146,158 C 144,148 146,134 152,124 Z',
        ],
    },
    {
        id: 'Forearms',
        label: 'Forearms',
        labelPos: { x: 100, y: 212 },
        paths: [
            // Left forearm — tapers toward wrist
            'M 36,176 C 28,180 22,194 20,210 C 18,224 22,236 30,238 C 36,240 42,234 44,222 C 46,210 44,192 38,178 Z',
            // Right forearm
            'M 164,176 C 172,180 178,194 180,210 C 182,224 178,236 170,238 C 164,240 158,234 156,222 C 154,210 156,192 162,178 Z',
        ],
    },
    {
        id: 'Quads',
        label: 'Quads',
        labelPos: { x: 100, y: 318 },
        // Rectus femoris + vastus lateralis/medialis blended
        paths: [
            // Left quad — wider at top, tapers to knee
            'M 76,268 C 68,272 60,288 58,310 C 56,332 60,352 70,358 C 76,362 84,358 88,348 C 92,338 94,318 92,298 C 90,280 84,270 76,268 Z',
            // Right quad
            'M 124,268 C 132,272 140,288 142,310 C 144,332 140,352 130,358 C 124,362 116,358 112,348 C 108,338 106,318 108,298 C 110,280 116,270 124,268 Z',
        ],
    },
    {
        id: 'Calves',
        label: 'Calves',
        labelPos: { x: 100, y: 422 },
        // Gastrocnemius — diamond shaped
        paths: [
            // Left calf — medial head wider
            'M 70,370 C 62,374 56,390 56,408 C 56,424 62,436 70,438 C 76,440 82,434 84,422 C 86,410 84,390 78,374 Z',
            // Left calf lateral head
            'M 84,372 C 90,376 94,390 94,406 C 94,420 90,430 84,432 C 80,432 76,428 76,420 C 76,412 78,396 80,382 Z',
            // Right calf medial
            'M 130,370 C 138,374 144,390 144,408 C 144,424 138,436 130,438 C 124,440 118,434 116,422 C 114,410 116,390 122,374 Z',
            // Right calf lateral
            'M 116,372 C 110,376 106,390 106,406 C 106,420 110,430 116,432 C 120,432 124,428 124,420 C 124,412 122,396 120,382 Z',
        ],
    },
];

// ─── Back Muscle Groups ───────────────────────────────────────────────────────
const BACK_MUSCLES = [
    {
        id: 'Traps',
        label: 'Traps',
        labelPos: { x: 100, y: 100 },
        paths: [
            // Trapezius — rhomboid covering upper back
            'M 100,80 C 88,82 74,88 68,94 C 62,100 60,114 64,126 C 68,136 78,144 88,148 C 94,150 100,150 100,150 C 100,150 106,150 112,148 C 122,144 132,136 136,126 C 140,114 138,100 132,94 C 126,88 112,82 100,80 Z',
        ],
    },
    {
        id: 'Upper Back',
        label: 'Upper Back',
        labelPos: { x: 100, y: 124 },
        // Mid-back / rhomboids — between traps and lower back
        paths: [
            'M 82,120 C 76,128 74,140 76,154 C 78,164 84,172 92,174 C 96,176 100,176 100,176 C 100,176 104,176 108,174 C 116,172 122,164 124,154 C 126,140 124,128 118,120 C 112,114 104,110 100,110 C 96,110 88,114 82,120 Z',
        ],
    },
    {
        id: 'Lats',
        label: 'Lats',
        labelPos: { x: 100, y: 148 },
        paths: [
            // Left lat wing
            'M 68,94 C 62,102 58,118 60,136 C 62,152 68,164 76,168 C 82,172 88,170 90,162 C 90,154 86,140 82,126 C 78,112 72,100 68,94 Z',
            // Right lat wing
            'M 132,94 C 138,102 142,118 140,136 C 138,152 132,164 124,168 C 118,172 112,170 110,162 C 110,154 114,140 118,126 C 122,112 128,100 132,94 Z',
        ],
    },
    {
        id: 'Triceps',
        label: 'Triceps',
        labelPos: { x: 100, y: 162 },
        paths: [
            // Left tricep — posterior upper arm
            'M 44,118 C 38,122 32,134 30,148 C 28,162 32,174 40,176 C 48,178 56,170 58,158 C 60,146 56,130 48,120 Z',
            // Right tricep
            'M 156,118 C 162,122 168,134 170,148 C 172,162 168,174 160,176 C 152,178 144,170 142,158 C 140,146 144,130 152,120 Z',
        ],
    },
    {
        id: 'Lower Back',
        label: 'Lower Back',
        labelPos: { x: 100, y: 196 },
        // Erector spinae / lumbar
        paths: [
            'M 86,156 C 80,162 76,174 76,190 C 76,206 80,218 88,224 C 94,228 100,228 100,228 C 100,228 106,228 112,224 C 120,218 124,206 124,190 C 124,174 120,162 114,156 C 108,152 100,150 100,150 C 100,150 92,152 86,156 Z',
        ],
    },
    {
        id: 'Glutes',
        label: 'Glutes',
        labelPos: { x: 100, y: 252 },
        // Gluteus maximus — two rounded teardrop shapes
        paths: [
            // Left glute
            'M 80,230 C 70,234 60,246 58,262 C 56,276 62,288 72,290 C 82,292 92,284 96,272 C 100,260 100,240 100,230 C 94,228 86,228 80,230 Z',
            // Right glute
            'M 120,230 C 130,234 140,246 142,262 C 144,276 138,288 128,290 C 118,292 108,284 104,272 C 100,260 100,240 100,230 C 106,228 114,228 120,230 Z',
        ],
    },
    {
        id: 'Hamstrings',
        label: 'Hamstrings',
        labelPos: { x: 100, y: 326 },
        // Biceps femoris + semitendinosus
        paths: [
            // Left hamstring
            'M 78,296 C 70,300 62,316 60,338 C 58,358 62,376 72,380 C 80,384 90,378 94,364 C 98,350 98,326 94,308 C 90,292 84,292 78,296 Z',
            // Right hamstring
            'M 122,296 C 130,300 138,316 140,338 C 142,358 138,376 128,380 C 120,384 110,378 106,364 C 102,350 102,326 106,308 C 110,292 116,292 122,296 Z',
        ],
    },
    {
        id: 'Calves',
        label: 'Calves',
        labelPos: { x: 100, y: 418 },
        paths: [
            // Left calf (posterior view — single mass)
            'M 68,390 C 60,396 56,412 58,428 C 60,442 68,452 76,452 C 84,452 90,444 90,430 C 90,416 86,400 80,392 Z',
            'M 82,390 C 88,396 92,410 92,424 C 92,438 88,448 82,450 C 78,450 76,446 76,438 C 76,428 78,412 80,398 Z',
            // Right calf
            'M 132,390 C 140,396 144,412 142,428 C 140,442 132,452 124,452 C 116,452 110,444 110,430 C 110,416 114,400 120,392 Z',
            'M 118,390 C 112,396 108,410 108,424 C 108,438 112,448 118,450 C 122,450 124,446 124,438 C 124,428 122,412 120,398 Z',
        ],
    },
];

// ─── Body Silhouettes ─────────────────────────────────────────────────────────
// Fully anatomical human figure within 200×500 viewBox

function FrontSilhouette({ fill, stroke }) {
    return (
        <g>
            {/* Head */}
            <ellipse cx="100" cy="44" rx="20" ry="24" fill={fill} stroke={stroke} strokeWidth="1" />
            {/* Neck */}
            <path d="M 92,64 L 92,76 C 94,78 100,80 100,80 C 100,80 106,78 108,76 L 108,64 Z" fill={fill} stroke={stroke} strokeWidth="1" />
            {/* Torso */}
            <path d="M 68,78 C 60,80 58,90 58,110 L 58,220 C 60,240 68,260 74,268 C 82,278 100,282 100,282 C 100,282 118,278 126,268 C 132,260 140,240 142,220 L 142,110 C 142,90 140,80 132,78 C 122,74 110,72 100,72 C 90,72 78,74 68,78 Z" fill={fill} stroke={stroke} strokeWidth="1" />
            {/* Left upper arm + forearm */}
            <path d="M 68,80 C 60,80 46,86 42,100 L 36,136 C 34,148 36,162 44,166 C 50,170 56,166 58,158 L 60,144 L 68,110 Z" fill={fill} stroke={stroke} strokeWidth="1" />
            <path d="M 36,138 C 28,142 18,160 16,178 L 14,210 C 12,226 18,242 28,244 C 36,246 44,238 46,226 L 50,202 C 52,186 46,162 38,142 Z" fill={fill} stroke={stroke} strokeWidth="1" />
            {/* Right upper arm + forearm */}
            <path d="M 132,80 C 140,80 154,86 158,100 L 164,136 C 166,148 164,162 156,166 C 150,170 144,166 142,158 L 140,144 L 132,110 Z" fill={fill} stroke={stroke} strokeWidth="1" />
            <path d="M 164,138 C 172,142 182,160 184,178 L 186,210 C 188,226 182,242 172,244 C 164,246 156,238 154,226 L 150,202 C 148,186 154,162 162,142 Z" fill={fill} stroke={stroke} strokeWidth="1" />
            {/* Hands */}
            <ellipse cx="24" cy="252" rx="10" ry="14" fill={fill} stroke={stroke} strokeWidth="1" />
            <ellipse cx="176" cy="252" rx="10" ry="14" fill={fill} stroke={stroke} strokeWidth="1" />
            {/* Left leg (thigh + shin) */}
            <path d="M 76,268 C 64,272 56,296 56,322 C 56,352 60,374 68,386 C 72,394 80,398 86,396 C 94,394 100,386 100,378 L 100,270 C 94,264 84,264 76,268 Z" fill={fill} stroke={stroke} strokeWidth="1" />
            <path d="M 60,370 C 52,378 48,394 50,416 C 52,436 58,452 68,456 C 76,460 84,456 88,444 C 92,432 92,412 88,392 Z" fill={fill} stroke={stroke} strokeWidth="1" />
            {/* Right leg */}
            <path d="M 124,268 C 136,272 144,296 144,322 C 144,352 140,374 132,386 C 128,394 120,398 114,396 C 106,394 100,386 100,378 L 100,270 C 106,264 116,264 124,268 Z" fill={fill} stroke={stroke} strokeWidth="1" />
            <path d="M 140,370 C 148,378 152,394 150,416 C 148,436 142,452 132,456 C 124,460 116,456 112,444 C 108,432 108,412 112,392 Z" fill={fill} stroke={stroke} strokeWidth="1" />
            {/* Feet */}
            <path d="M 50,454 C 42,456 36,466 40,474 C 44,480 56,482 68,480 C 76,478 82,472 80,466 C 78,460 70,454 62,454 Z" fill={fill} stroke={stroke} strokeWidth="1" />
            <path d="M 150,454 C 158,456 164,466 160,474 C 156,480 144,482 132,480 C 124,478 118,472 120,466 C 122,460 130,454 138,454 Z" fill={fill} stroke={stroke} strokeWidth="1" />
        </g>
    );
}



export const ALL_MUSCLES = [
    'Chest', 'Abs', 'Shoulders', 'Biceps', 'Forearms',
    'Traps', 'Upper Back', 'Lats', 'Triceps', 'Lower Back', 'Glutes', 'Quads', 'Hamstrings', 'Calves',
];

// ─── Difficulty colors ────────────────────────────────────────────────────────
const DIFF_COLOR = { Beginner: '#4ade80', Intermediate: '#fbbf24', Advanced: '#f87171' };

// ─── Exercise Card ────────────────────────────────────────────────────────────
function ExerciseCard({ exercise, theme, accent, isCustom, onRemove, onAddToWorkout }) {
    const diffColor = DIFF_COLOR[exercise.difficulty] || accent;
    const perf = getExercisePerf(exercise.name);
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl p-4 flex flex-col gap-2 border relative h-full justify-between"
            style={{ background: theme.surface, borderColor: isCustom ? `${accent}40` : `${theme.textPrimary}08` }}
        >
            <div>
                {isCustom && (
                    <button
                        onClick={onRemove}
                        className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity"
                        style={{ background: `${theme.textPrimary}15`, color: theme.textSecondary }}
                    >
                        <X size={10} />
                    </button>
                )}
                {exercise.difficulty && (
                    <div
                        className="text-[8px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full inline-block mb-1"
                        style={{ background: `${diffColor}22`, color: diffColor }}
                    >
                        {exercise.difficulty}
                    </div>
                )}
                <p className="text-sm font-medium leading-snug pr-4" style={{ color: theme.textPrimary }}>
                    {exercise.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                    <p className="text-[10px] font-normal tracking-wide" style={{ color: theme.textSecondary }}>
                        {exercise.sets}
                    </p>
                    {isCustom && (
                        <span className="text-[8px] uppercase tracking-widest" style={{ color: accent }}>Custom</span>
                    )}
                </div>

                {/* ── Performance Data ── */}
                {perf && (
                    <div className="flex items-center gap-3 mt-2 pt-2" style={{ borderTop: `1px solid ${theme.textPrimary}08` }}>
                        <div className="flex items-center gap-1">
                            <TrendingUp size={10} style={{ color: accent }} />
                            <span className="text-[9px] font-semibold tracking-wide" style={{ color: accent }}>
                                Max: {perf.maxWeight}kg
                            </span>
                        </div>
                        <span className="text-[9px] font-medium tracking-wide" style={{ color: theme.textSecondary }}>
                            Last: {perf.lastWeight}kg
                        </span>
                    </div>
                )}
            </div>

            <button
                onClick={() => onAddToWorkout(exercise)}
                className="mt-3 py-2 rounded-xl flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest transition-all hover:brightness-110 active:scale-95"
                style={{ background: `${theme.textPrimary}08`, color: theme.textPrimary }}
                title="Add to Workout"
            >
                <Plus size={12} /> Add
            </button>
        </motion.div>
    );
}

// ─── Add Custom Exercise Modal ────────────────────────────────────────────────
function AddExerciseModal({ onAdd, onClose, theme, accent, selectedMuscle, selectedEquipment }) {
    const [exName, setExName] = useState('');
    const [exMuscle, setExMuscle] = useState(selectedMuscle || ALL_MUSCLES[0]);
    const [exEquip, setExEquip] = useState(selectedEquipment || EQUIPMENT_OPTIONS[0]);
    const [exSets, setExSets] = useState('3×10');
    const [exDiff, setExDiff] = useState('Beginner');

    const inputStyle = {
        background: `${theme.background}90`,
        borderColor: `${theme.textPrimary}15`,
        color: theme.textPrimary,
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-sm rounded-[2rem] p-6 border"
                style={{ background: theme.surface, borderColor: `${accent}30` }}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold uppercase tracking-wider" style={{ color: theme.textPrimary }}>
                        Add Exercise
                    </h3>
                    <button onClick={onClose} style={{ color: theme.textSecondary }}>
                        <X size={20} />
                    </button>
                </div>

                <div className="flex flex-col gap-4">
                    {/* Name */}
                    <input
                        placeholder="Exercise name"
                        value={exName}
                        onChange={e => setExName(e.target.value)}
                        className="w-full rounded-xl px-4 py-3 text-sm outline-none border"
                        style={inputStyle}
                    />

                    {/* Muscle */}
                    <select
                        value={exMuscle}
                        onChange={e => setExMuscle(e.target.value)}
                        className="w-full rounded-xl px-4 py-3 text-sm outline-none border"
                        style={inputStyle}
                    >
                        {ALL_MUSCLES.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>

                    {/* Equipment */}
                    <select
                        value={exEquip}
                        onChange={e => setExEquip(e.target.value)}
                        className="w-full rounded-xl px-4 py-3 text-sm outline-none border"
                        style={inputStyle}
                    >
                        {EQUIPMENT_OPTIONS.map(eq => <option key={eq} value={eq}>{eq}</option>)}
                    </select>

                    {/* Sets & Difficulty row */}
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            placeholder="Sets (e.g. 3×10)"
                            value={exSets}
                            onChange={e => setExSets(e.target.value)}
                            className="w-full rounded-xl px-4 py-3 text-sm outline-none border"
                            style={inputStyle}
                        />
                        <select
                            value={exDiff}
                            onChange={e => setExDiff(e.target.value)}
                            className="w-full rounded-xl px-4 py-3 text-sm outline-none border"
                            style={inputStyle}
                        >
                            {['Beginner', 'Intermediate', 'Advanced'].map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>

                    <button
                        onClick={() => {
                            if (!exName.trim()) return;
                            onAdd({ name: exName.trim(), muscle: exMuscle, equipment: exEquip, sets: exSets, difficulty: exDiff });
                            onClose();
                        }}
                        disabled={!exName.trim()}
                        className="w-full py-4 rounded-2xl font-semibold uppercase tracking-widest text-sm transition-all active:scale-95 disabled:opacity-30"
                        style={{ background: accent, color: theme.background }}
                    >
                        Add Exercise
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─── Main BodyMap component ───────────────────────────────────────────────────
export default function BodyMap({ selectedMuscle, onSelect, theme, accent, selectedEquipment, customExercises, onAddCustom, onRemoveCustom, onAddToWorkout }) {
    const [showAddModal, setShowAddModal] = useState(false);

    // Only show exercises when BOTH muscle AND equipment are selected
    const bothSelected = selectedMuscle && selectedEquipment;

    const filteredDefault = bothSelected
        ? EXERCISE_DB.filter(ex => ex.muscle === selectedMuscle && ex.equipment === selectedEquipment)
        : [];

    const filteredCustom = (bothSelected && customExercises)
        ? customExercises.filter(ex => ex.muscle === selectedMuscle && ex.equipment === selectedEquipment)
        : [];

    const totalCount = filteredDefault.length + filteredCustom.length;

    const [viewSide, setViewSide] = useState('front');

    return (
        <div className="w-full flex flex-col gap-8">

            {/* ── Mobile toggle ── */}
            <div className="flex md:hidden justify-center gap-2">
                {['front', 'back'].map(side => (
                    <button
                        key={side}
                        onClick={() => setViewSide(side)}
                        className="px-5 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-widest border transition-all active:scale-95"
                        style={viewSide === side
                            ? { color: accent, borderColor: accent, background: `${accent}15` }
                            : { color: theme.textSecondary, borderColor: `${theme.textPrimary}15`, background: 'transparent' }}
                    >
                        {side}
                    </button>
                ))}
            </div>

            {/* ── Dual SVG Bodies (desktop: side-by-side | mobile: one at a time) ── */}
            <div className="w-full flex items-start justify-center gap-4 md:gap-8">

                {/* Front — always visible on desktop, conditional on mobile */}
                <div className={`flex flex-col items-center flex-1 max-w-[260px] ${viewSide !== 'front' ? 'hidden md:flex' : ''}`}>
                    <span className="text-[9px] font-medium uppercase tracking-[0.3em] mb-3" style={{ color: theme.textSecondary }}>
                        Front
                    </span>
                    <div className="w-full" style={{ height: 'clamp(420px, 75vh, 620px)' }}>
                        <BodySVG isFront={true}
                            selectedMuscle={selectedMuscle} onSelect={onSelect} theme={theme} accent={accent} />
                    </div>
                </div>

                <div className="hidden md:block w-px self-stretch mt-10 flex-shrink-0" style={{ background: `${theme.textPrimary}10` }} />

                {/* Back — always visible on desktop, conditional on mobile */}
                <div className={`flex flex-col items-center flex-1 max-w-[260px] ${viewSide !== 'back' ? 'hidden md:flex' : ''}`}>
                    <span className="text-[9px] font-medium uppercase tracking-[0.3em] mb-3" style={{ color: theme.textSecondary }}>
                        Back
                    </span>
                    <div className="w-full" style={{ height: 'clamp(420px, 75vh, 620px)' }}>
                        <BodySVG isFront={false}
                            selectedMuscle={selectedMuscle} onSelect={onSelect} theme={theme} accent={accent} />
                    </div>
                </div>
            </div>

            {/* ── Exercise Results ── */}
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-px flex-1" style={{ background: `${theme.textPrimary}10` }} />
                    {bothSelected ? (
                        <div
                            className="px-5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest border"
                            style={{ borderColor: accent, color: accent, background: `${accent}15` }}
                        >
                            {selectedMuscle} · {selectedEquipment} · {totalCount} Exercises
                        </div>
                    ) : (
                        <div
                            className="px-5 py-1.5 rounded-full text-xs font-medium uppercase tracking-widest border"
                            style={{ borderColor: `${theme.textPrimary}15`, color: theme.textSecondary, background: 'transparent' }}
                        >
                            {!selectedMuscle ? 'Select a muscle' : 'Select equipment below'}
                        </div>
                    )}
                    <div className="h-px flex-1" style={{ background: `${theme.textPrimary}10` }} />
                </div>

                {bothSelected && (
                    <AnimatePresence mode="popLayout">
                        <motion.div
                            key={`${selectedMuscle}-${selectedEquipment}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {totalCount === 0 ? (
                                <div
                                    className="text-center py-10 rounded-2xl border"
                                    style={{ borderColor: `${theme.textPrimary}08`, color: theme.textSecondary }}
                                >
                                    <p className="text-sm font-normal italic">No exercises found for this combination.</p>
                                    <p className="text-[10px] mt-1 uppercase tracking-widest">Try adding a custom one below ↓</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                                    <AnimatePresence>
                                        {filteredDefault.map((ex, i) => (
                                            <ExerciseCard key={`${ex.name}-${i}`} exercise={ex} theme={theme} accent={accent} isCustom={false} onAddToWorkout={onAddToWorkout} />
                                        ))}
                                        {filteredCustom.map((ex, i) => (
                                            <ExerciseCard
                                                key={`custom-${i}`} exercise={ex} theme={theme} accent={accent} isCustom
                                                onRemove={() => onRemoveCustom(ex)} onAddToWorkout={onAddToWorkout}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                )}

                {/* Add custom exercise button */}
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 mx-auto mt-2 px-5 py-2.5 rounded-full border text-[10px] font-medium uppercase tracking-widest transition-all active:scale-95 hover:brightness-110"
                    style={{ borderColor: `${accent}40`, color: accent, background: `${accent}10` }}
                >
                    <Plus size={12} />
                    Add Custom Exercise
                </button>
            </div>

            {/* ── Add Modal ── */}
            <AnimatePresence>
                {showAddModal && (
                    <AddExerciseModal
                        onAdd={onAddCustom}
                        onClose={() => setShowAddModal(false)}
                        theme={theme}
                        accent={accent}
                        selectedMuscle={selectedMuscle}
                        selectedEquipment={selectedEquipment}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
