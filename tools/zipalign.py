import struct
import sys
import zipfile

# FUNCTIONS
def alignFor(name):
    return 4096 if name.endswith(".so") else 4


def main(source, target):
    entries = []
    with zipfile.ZipFile(source) as archive, open(source, "rb") as raw, open(target, "wb") as out:
        for info in archive.infolist():
            raw.seek(info.header_offset)
            header = raw.read(30)
            nameLen, extraLen = struct.unpack("<HH", header[26:30])
            nameBytes = raw.read(nameLen)
            raw.read(extraLen)
            data = raw.read(info.compress_size)

            flags = info.flag_bits & ~0x08
            offset = out.tell()
            extra = b""
            if info.compress_type == zipfile.ZIP_STORED:
                alignment = alignFor(info.filename)
                dataStart = offset + 30 + len(nameBytes)
                padding = (alignment - dataStart % alignment) % alignment
                extra = b"\x00" * padding
            dosTime, dosDate = header[10:12], header[12:14]
            local = struct.pack("<IHHH", 0x04034B50, 20, flags, info.compress_type)
            local += dosTime + dosDate
            local += struct.pack("<IIIHH", info.CRC, info.compress_size, info.file_size, len(nameBytes), len(extra))
            out.write(local)
            out.write(nameBytes)
            out.write(extra)
            out.write(data)
            entries.append((info, nameBytes, flags, dosTime, dosDate, offset))

        centralStart = out.tell()
        for info, nameBytes, flags, dosTime, dosDate, offset in entries:
            central = struct.pack("<IHHHH", 0x02014B50, 20, 20, flags, info.compress_type)
            central += dosTime + dosDate
            central += struct.pack("<IIIHHHHHII", info.CRC, info.compress_size, info.file_size, len(nameBytes), 0, 0, 0, 0, info.external_attr, offset)
            out.write(central)
            out.write(nameBytes)
        centralSize = out.tell() - centralStart
        out.write(struct.pack("<IHHHHIIH", 0x06054B50, 0, 0, len(entries), len(entries), centralSize, centralStart, 0))


# INITIALIZATION
if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
