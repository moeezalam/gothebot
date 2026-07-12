# -*- mode: python ; coding: utf-8 -*-


a = Analysis(
    ['scripts\\book_one.py'],
    pathex=['.'],
    binaries=[],
    datas=[],
    hiddenimports=['curl_cffi', 'undetected_chromedriver', 'plyer', 'bcrypt', 'cryptography', 'sqlalchemy', 'gspread', 'pydantic', 'bs4', 'selenium.webdriver.common.action_chains', 'selenium.webdriver.common.actions.interaction', 'selenium.webdriver.common.actions.wheel_input', 'selenium.webdriver.common.actions.pointer_actions', 'selenium.webdriver.common.actions.key_actions', 'selenium.webdriver.remote.remote_connection', 'selenium.webdriver.remote.webdriver', 'selenium.webdriver.support.ui', 'selenium.webdriver.support.expected_conditions'],
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
    a.binaries,
    a.datas,
    [],
    name='goethe-booker',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
