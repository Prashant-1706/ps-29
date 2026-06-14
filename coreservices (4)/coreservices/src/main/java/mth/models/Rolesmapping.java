package mth.models;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.util.Objects;

@Entity
@Table
public class Rolesmapping implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	Long role;
	
	@Id
	Long mid;

	public Long getRole() {
		return role;
	}

	public void setRole(Long role) {
		this.role = role;
	}

	public Long getMid() {
		return mid;
	}

	public void setMid(Long mid) {
		this.mid = mid;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (o == null || getClass() != o.getClass()) return false;
		Rolesmapping that = (Rolesmapping) o;
		return Objects.equals(role, that.role) && Objects.equals(mid, that.mid);
	}

	@Override
	public int hashCode() {
		return Objects.hash(role, mid);
	}
}
