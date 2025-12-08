# -*- mode: python ; coding: utf-8 -*-


a = Analysis(
    ['backend/main.py'],
    pathex=[],
    binaries=[],
    datas=[("frontend/dist", "backend/app/static")],
    hiddenimports=[
        "celery.fixups",
        "celery.fixups.django",
        "celery.loaders.app",
        "celery.concurrency.solo",
        "celery.apps.worker",
        "celery.app.log",
        "celery.app.amqp",
        "kombu.transport.sqlalchemy",
        "celery.worker.components",
        "celery.worker.autoscale",
        "celery.worker.consumer",
        "celery.worker.consumer.delayed_delivery",
        "celery.app.control",
        "celery.app.events",
        "celery.backends.database",
        "celery.worker.strategy",
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='main',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='main',
)
